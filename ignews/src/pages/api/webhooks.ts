import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream"
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable){
   const chunks = [];

   for await (const chunk of readable){
      chunks.push(
         typeof chunk === "string" ? Buffer.from(chunk): chunk
      );
   }
   return Buffer.concat(chunks);
}

export const config = {
   api: {
      bodyParser: false
      // desabilitando entendimento padrão do Next
   }
}

const relevantEvents = new Set([
   'checkout.session.completed',
   'customer.subscription.updated',
   'customer.subscription.deleted'
])

const webhookStripe = async (req: NextApiRequest, res: NextApiResponse) => {

   if (req.method === 'POST') {
      console.log("Entrei em POST")
      const buf = await buffer(req);
      const secret = req.headers['stripe-signature'];

      let event: Stripe.Event;

      try{
         event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
      }
      catch (err){
         console.log("Falhou")
         console.log(err.message)
         return res.status(400).send(`Webhook error: ${err.message}`);
      }

      const { type } = event;
     
      
      if(relevantEvents.has(type)){
         console.log('Evento recebido:', type)
         try{
            switch(type){
               case 'customer.subscription.deleted':
               case 'customer.subscription.updated':
                  const subscription = event.data.object as Stripe.Subscription;
                 
                  await saveSubscription(
                     subscription.id,
                     subscription.customer.toString(),
                     false
                     )
                  
                  break;
               case 'checkout.session.completed':
                  const checkoutSession = event.data.object as Stripe.Checkout.Session

                  await saveSubscription(
                     checkoutSession.subscription.toString(),
                     checkoutSession.customer.toString(),
                     true,
                  )
                  break;
            }
         }
         catch(err){
            return res.json({error:"Webhook handler failed"})
         }
      }

      res.status(200).json({received: true})
   }
   else {
      res.setHeader('Allow', 'POST')
      res.status(405).end('Method not Allowed')
   }
}
export default webhookStripe