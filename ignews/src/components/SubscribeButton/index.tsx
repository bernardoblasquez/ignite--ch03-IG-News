import {useSession, signIn} from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js';
import styles from './style.module.scss';

interface SubscribeButtonProps{
   priceId: string;
}

export function SubscribeButton({priceId}:SubscribeButtonProps) {
   const {data:session} = useSession();
   const router = useRouter();
   
   async function handleSubscribe(){
      if (!session) {
         signIn('github') 
         return;
      }

      console.log(session.activeSubscription)

      if (session.activeSubscription) {
         console.log("redirecionado para POSTS")
         router.push("/posts");
         return;
      }

      try {
         console.log("Entrei no subscribe")
         const response = await api.post('/subscribe')

         const { sessionId } = response.data;
         
         // Não tá recebendo a resposta
         console.log(response.data);

         const stripe = await getStripeJs();

         await stripe.redirectToCheckout({sessionId:sessionId})
      }
      catch (err){
         alert(err.message);
      }
         
   }

   return(
      <button
         type="button"
         className={styles.subscribeButton}
         onClick={() => handleSubscribe()}
      >
         Subscribe Now
      </button>
   )
}