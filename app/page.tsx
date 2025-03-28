import FeedAlt from './components/FeedAlt';
import styles from './HomePage.module.css';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main>
      
      <div className={styles.logoContainer}>
      <br></br>
        <center>
        <Image 
          src="/name.png" 
          alt="INFO BIOM Personal Feed" 
          width={300} 
          height={50} 
          layout="fixed"
        />
        </center>
        <br></br>
      </div>
      <FeedAlt />
    </main>
  );
}
