import {React, useEffect, useState} from 'react'
import { useNavigate} from 'react-router-dom';
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'

function Insert() {

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [data, setData] = useState(null)
  const [id, setId] = useState(0)
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
 

  // const navigate = useNavigate()

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formdata = new FormData()
    formdata.append('file', image)
    
    try {
      const insertResponse = await axios.post('http://localhost:5000/api/Insert', {
        name,
        price,
        id
      });
      setData(insertResponse.data.message);
      toast.success("Item inserted successfully!!")
      setName('')
      setPrice('')
      setImagePreview('')
      setId(id => id+1)
    } catch (error) {
      console.error('Error submitting data:', error);
    }

    try {
      const uploadResponse = await axios.post('http://localhost:5000/uploads', formdata);
      console.log(uploadResponse.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }


  };


  return (
    <div className='input-items'>
        
        <form onSubmit={handleSubmit}>
            <label htmlFor='item-name'>Item Name</label>
            <input type="text" id="item-name" value={name} placeholder='Enter Item name' onChange={(e) => setName(e.target.value)} />
            <br />

            <label htmlFor='item-price'>Item Price</label>
            <input type="text" id="item-price" value={price} placeholder='Enter Item Price'onChange={(e) => setPrice(e.target.value)} />
            <br />

            <label htmlFor='item-image'>Upload Image</label>
            <input type="file" id="item-image" name='item-image'accept="image/*" onChange={handleImageChange}/>
            <br />

            {imagePreview && (
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px' }} />
            )}
            <button type="submit">Make</button>
        </form>
        <ToastContainer />
        
    </div>
  )
}

export default Insert
