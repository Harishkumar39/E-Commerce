import React, { useEffect, useState } from 'react'
import Cart from './Cart';
import axios from 'axios';

function Card(props) {

  const [qty, setQty] = useState(props.item.qty)

  const [ID, setID] = useState(false)  
  const [cartBtn, setCartBtn] = useState('Add to Cart')
  const [disable, setDisable] = useState(()=>{
    const disableStatus = localStorage.getItem(`disable-${props.item.id}`);
    return disableStatus === 'true';
  })

  const HandleCart = ()=>{
    props.addToCart({
      id: props.item.id,
      name: props.item.name, 
      price: props.item.price, 
      qty: qty, 
      imageUrl:props.item.imageUrl
    })
    
    setCartBtn('Added')
    setDisable(true)
    
    localStorage.setItem(`disable-${props.item.id}`,true)
  }

  const handleQty = async(e) =>{
    const newQty = parseInt(e.target.value);
    setQty(newQty);
    try {
      const response = await axios.post('http://localhost:5000/cart/updateQty',{
        id: props.item.id,
        qty: newQty
      })
      props.onQtyChange()
      console.log("Qty updated successfully!");
    } catch (error) {
      console.log("Error in Updating Qty : "+ error);
    }
  }


  return (
    <div className='card-item'>
      <div className='card-image'>
        <img className='image' src={props.item.imageUrl} alt='Image'/>
      </div>
      <div className='card-content'>
        <h3>{props.item.name}</h3>
        <h5>Rs. {props.item.price}</h5>
      </div>
      <div className='bottom-card'>
        <div className='Quantity'>
          <p>Qty : </p>
          <input type="number" className="qty" id='qty' min={1} value={qty} onChange={(e)=>{setQty(e.target.value)}} onClick={handleQty} />
        </div>
        <div className='cart-btn'>
          <button id={`btn-${props.itemNo}`} onClick={HandleCart} disabled={disable} >{cartBtn}</button>
        </div>
      </div>
    </div>
  )
}

export default Card
