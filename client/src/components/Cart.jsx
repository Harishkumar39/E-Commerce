import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Card from './Card';
import Checkout from './Checkout';

function Cart() {

  const [cartItm, setCartItm] = useState([])
  // const [id, setId] = useState(0)
  const [reloadFlag, setReloadFlag] = useState(false);

  useEffect(()=>{
    const cartCall = async() =>{
      try {
        const Response = await axios.get('http://localhost:5000/Cart')
        const data = Response.data
        console.log(data);
        setCartItm(data)
      } catch (error) {
        console.log("Error "+error);
      }
    } 
    cartCall()
  
  },[])

  useEffect(() => {
    const addTrashCanButtons = () => {
      const btns = document.getElementsByClassName(`cart-btn`);
      for (let i = 0; i < btns.length; i++) {
        const element = document.getElementById(`btn-${i}`)
        if(element){
          element.classList.add('active')
          btns[i].innerHTML=''
          const button = document.createElement('button');
          button.innerHTML = '<span>&#128465;</span>';
          button.onclick = () => handleRemove(cartItm[i].id);
          button.id = `btn-${i}`;
          btns[i].appendChild(button);
        }
      }
    };
    addTrashCanButtons();
    
  }, [cartItm]);

  const handleRemove = async (index) => {
    try {
      // Implement your remove logic here
      const Response = await axios.post("http://localhost:5000/removeFromCart",{index})
      console.log('Removing item at index: ', index);
      const updtCart = cartItm.filter((item, ind)=> item.id !== index )
      localStorage.setItem(`disable-${index}`, false)
      setCartItm(updtCart)
      window.location.reload();
      
    } catch (error) {
      console.log('Error removing item: ', error);
    }
  };

  const handleQtyCh = () =>{
    setReloadFlag(prevFlag => !prevFlag);
  }

  

  // if (cartItm) {
  //   return <div>No items in the cart</div>;
  // }

  return (
    <div className='cart'>
      {cartItm.length > 0 ? (
        <>
         
          {cartItm.map((item, index) => (
            <div key={index}>
              <Card key={item.id} itemNo={index} item={item} onQtyChange={handleQtyCh}/>
            </div>
          ))}
          <Checkout item={cartItm} reloadFlag={reloadFlag}/>
        </>
      ) : (
        <div className='mtcart'>
          <h4>Cart is empty</h4>
          <img src="../images/mtcart.png" alt="Cart Empty" />
        </div>
      )}
    </div>
  )
}

export default Cart