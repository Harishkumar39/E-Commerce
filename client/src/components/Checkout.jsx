import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import '../Checkout.css';


function Checkout(props) {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [gst, setGst] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('')
  const [otpValid, setOtpValid] = useState(false)
  const [otpSent, setOtpSent] = useState(false) 
  const [paymentId, setPaymentId] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    async function fetchCartItems() {
      try {
        const response = await axios.get('http://localhost:5000/cart');
        setCartItems(response.data);
      } catch (error) {
        console.log("Error fetching cart items: " + error);
      }
    }
    fetchCartItems();
  }, [props.reloadFlag]);

  // Calculate total price
  useEffect(() => {
    let total = 0;
    cartItems.forEach(item => {
      total += item.qty * item.price;
    });
    setTotalPrice(total);
  }, [cartItems]);

  // Calculate GST
  useEffect(() => {
    const gstRate = 0.18; // Assuming GST rate is 18%
    const gstAmount = totalPrice * gstRate;
    setGst(gstAmount);
  }, [totalPrice]);

  // Calculate delivery fee (example)
  useEffect(() => {
    // Implement your delivery fee calculation logic here
    // Example: Set a fixed delivery fee of Rs. 50
    const deliveryFee = 50;
    setDeliveryFee(deliveryFee);
  }, []);

  useEffect(()=>{
    async function paymentSuccess(){
        try {
          await axios.post('http://localhost:5000/cart/checkout/order',{email})
          console.log("Purchase successful");
        } catch (error) {
          console.log("Error in payment Success "+error);
        }
    }
    paymentSuccess()
  }, [paymentId])


  const handleOrderSubmit = async(e) =>{
    e.preventDefault()
    localStorage.clear()
    const order = {
      name,
      email,
      phone,
      totalPrice, 
      gst,
      deliveryFee,
      totalAmount:totalPrice+gst+deliveryFee
    }
    try {
      const Response = await axios.post("http://localhost:5000/cart/checkout", order)
      console.log(Response.data);
      const {orderID, amount, curr} = Response.data
      var options = {
        key: "rzp_test_UHvz6ZssWrtKoB",
        key_secret:"frrBLsR9TGAwrcw8Us6ltGTM",
        amount: amount,
        currency: curr,
        order_id: orderID,
        name:"SURESH STATIONERYS (ADYAR)",
        description:"For stationery purpose",
        handler: function(response){
          setPaymentId(response.razorpay_payment_id);
          alert('Payment Successful. Payment ID : '+response.razorpay_payment_id);
          navigate('/')
        },
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        notes:{
          address:"Razorpay Corporate office"
        },
        theme: {
          color:"#3399cc"
        }
      };
      var pay = new window.Razorpay(options);
      pay.open();
      
    } catch (error) {
      console.log("Error in Order Submit : "+error);
    }
  }

  const handleVerify = async(e) =>{
    e.preventDefault()
    
    try{
      const Response = await axios.post("http://localhost:5000/cart/verify",{email})
      console.log(Response.data);
      setOtpSent(true)
    }catch(error){
      console.log("Error : "+error);
    }
  }

  const handleOtpValidation = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/cart/validate-otp', { email, otp });
      console.log(response.data);
      if (response.data.valid) {
        toast.success("Otp validated successfully")
        setOtpValid(true);
      } else {
        alert('Invalid OTP');
      }
    } catch (error) {
      console.log('Error validating OTP: ' + error);
    }
  };

  return (
    <div className='checkout-container'>
      <ToastContainer/>
      <h1>Checkout</h1>
      <div className='checkout-details'>
        <div className='order-summary'>
          <h3>Order Summary</h3>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index}>
                {item.name} - Qty {item.qty}
              </li>
            ))}
          </ul>
          <div className='total'>
            <p>Total Price: Rs. {totalPrice.toFixed(2)}</p>
            <p>GST (18%): Rs. {gst.toFixed(2)}</p>
            <p>Delivery Fee: Rs. {deliveryFee.toFixed(2)}</p>
            <p>Total Amount: Rs. {(totalPrice + gst + deliveryFee).toFixed(2)}</p>
          </div>
        </div>
        <form onSubmit={handleOrderSubmit} className='checkout-form'>
          <h3>Enter Your Details</h3>
          <input type='text' placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} required />
          <div className='verify'>
            <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type='button' onClick={handleVerify} disabled={otpSent} >Verify</button>
          </div>
          {otpSent && (
            <div className='otp'>
            <input type="text" className='otp'  value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder='Enter OTP' required />
            <button type='button' onClick={handleOtpValidation} disabled={otpValid} >Validate Otp</button>
            </div>
          )}
          <input type='tel' placeholder='Phone' value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <textarea placeholder='Address' value={address} onChange={(e) => setAddress(e.target.value)} required></textarea>
          <button disabled={!otpValid} type='submit'>Place Order</button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
