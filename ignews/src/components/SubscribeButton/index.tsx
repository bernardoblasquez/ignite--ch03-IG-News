import {useSession, signIn} from 'next-auth/react';
import styles from './style.module.scss';

interface SubscribeButtonProps{
   priceId: string;
}

export function SubscribeButton({priceId}:SubscribeButtonProps) {
   const {data:session} = useSession();
   
   function handleSubscribe(){
      if (!session) {
         signIn('github')
         return;
      }

      
   }

   return(
      <button
         type="button"
         className={styles.subscribeButton}
      >
         Subscribe Now
      </button>
   )
}