import '../styles.css';
// import '../Checkout.css'
import { useNavigate } from 'react-router-dom';
function Header(){

    // const navigate = useNavigate()

    function handleToggle(){
        document.querySelector(".navbar-nav").classList.toggle('active')
    }

    // function handleAbout(){
    //     navigate("/Insert")
    // }
    

    return(
        <header className="App-header">
            <nav className="navbar">
                <h2>Suresh Stationerys (Adyar)</h2>
                <button class="navbar-toggler" onClick={handleToggle}>&#9776;</button>
                <ul className="navbar-nav">
                    <li className="nav-item"><a href='/'>Home</a></li>
                    <li className="nav-item"><a href='/About'>About</a></li>
                    <li className="nav-item"><a href='/Location'>Location</a></li>
                    <li className="nav-item"><a href='/Cart'>Cart</a></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;