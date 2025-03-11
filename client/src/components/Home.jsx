import React, { useEffect, useState } from 'react'
import Card from './Card';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Home() {

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state
    const [cartItems, setCartItems] = useState([])

    useEffect(()=>{
        const fetchData = async () => {
            try {
              const response = await fetch('http://e-commerce-phi-inky.vercel.app');
              if (!response.ok) {
                throw new Error('Failed to fetch data');
              }
              const data = await response.json();
              console.log(data);
              setItems(data);
              setLoading(false)
              
            } catch (error) {
              console.error('Error fetching data:', error);
              setLoading(false)
            }
          };
      
          fetchData();
         
    },[])

    const addToCart = async(Item) =>{
      // const updatedCart = [...cartItems, Item]
      
      try {
        const resp = await axios.post('http://localhost:5000/Cart',Item)
        if (resp.data.success) {
          toast.success("Added to cart successfully!!");
        } else {
            throw new Error('Failed to add item to cart');
        }
        // console.log(resp.data.success);
        // setCartItems(updatedCart)
        // toast.success("Added to cart successfully!!")

      } catch (error) {
        console.log('Error has occured while adding to cart '+error);
      }
      
      
    }

    if (loading) {
        return <div>Loading...</div>; // Display loading message while fetching data
      }
    
    return (
        <div className='home'>
          <div className='card'>{items.map((item, index)=>
              <Card key={index} itemNo = {index} item={item} addToCart = {addToCart}/>
          )}</div>
          
        </div>
    )
}

export default Home
