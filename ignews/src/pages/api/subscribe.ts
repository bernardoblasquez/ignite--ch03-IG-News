import { NextApiRequest, NextApiResponse } from "next";
import { getSession, SessionProvider } from "next-auth/react";
import { query as q } from 'faunadb';
import { fauna } from '../../services/fauna'
import { stripe } from '../../services/stripe';
import email from "next-auth/providers/email";

type User = {
   ref: {
      id: string;
   }
   data: { 
      stripe_customer_id: string;
   }
}


const Subscribe = async (req: NextApiRequest, res: NextApiResponse) => {
   if (req.method === 'POST'){
      const session = await getSession({ req })

      // verifica a existência de uma usuário no fauna - pelo e-amil
      const user = await fauna.query<User>(
         q.Get( //select user
            q.Match(
               q.Index('user_by_email'),
               q.Casefold(session.user.email)
            )
         )
      )

      let customerId = user.data.stripe_customer_id;

      if(!customerId){

         // Create a new user on stripe
         const stripeCustomer = await stripe.customers.create({
            email: session.user.email,
         })
   
         // cadastra id do usuário do stripe no fauna
         await fauna.query(
            q.Update(
               q.Ref(q.Collection('users'), user.ref.id),
               {
                  data: { 
                     stripe_costumer_id: stripeCustomer.id,
                  }
               }
            )
         )
         customerId = stripeCustomer.id;
      }

      
      const stripeCheckoutSession = await stripe.checkout.sessions.create({
         customer: customerId,
         payment_method_types:['card'],
         billing_address_collection:'required',
         line_items: [
            {price: 'price_1K3dwnJG6hah13239txCjvVS', quantity: 1}
         ],
         mode: 'subscription',
         allow_promotion_codes: true,
         success_url: process.env.STRIPE_SUCCESS_URL,
         cancel_url: process.env.STRIPE_CANCEL_URL
      })

      return res.status(200).json({ sessionId: stripeCheckoutSession.id })
   }
   else {
      res.setHeader('Allow', 'POST')
      res.status(405).end('Method not Allowed')
   }
}

export default Subscribe