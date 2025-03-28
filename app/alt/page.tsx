import FeedAlt from '../components/FeedAlt';
import Image from 'next/image';
import React from 'react';
import "@/app/alt/style.css";

export default function AltPage() {
  return (
    <>
     <main>
      
      <div className="logoContainer">
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
    </>
  );
}
