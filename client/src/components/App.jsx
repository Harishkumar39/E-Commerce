import Header from './Header';
import Footer from './Footer';
import Insert from './Insert';
import About from './About';
import Location from './Location'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './Home';
import Cart from './Cart';
function App() {
  return (
    <div className="App">
      <Header />
      <Router>
        <Routes>
          <Route exact path='/' element={<Home />} />
          <Route path='/api/Insert' element={<Insert />} />
          <Route path='/Cart' element={<Cart/>} />
          <Route path='/About' element={<About />} />
          <Route path='/Location' element={<Location />} />
        </Routes>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
