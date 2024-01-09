/**
 * 
 *
 * @component
 * @name Login
 * @returns {JSX.Element} - Elemento JSX que representa la página de inicio de sesión y registro.
 */
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  // Estados para almacenar datos de usuario y mensajes
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  //  navegar entre rutas
  const navigate = useNavigate();

  /**
   * 
   *
   * @function
   * @name handleAuth
   * @param {Object} e - Evento de formulario.
   * @returns {void}
   */
  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      // Determina el endpoint según si es un inicio de sesión o registro
      const endpoint = isLogin ? 'login' : 'register';

      // Envía una solicitud al servidor con las credenciales
      const response = await axios.post(`http://localhost:8000/auth/${endpoint}`, { username, password });

      // Muestra el mensaje de la respuesta del servidor
      setMessage(response.data.message);

      // Redirige a la página de mascotas después de un inicio de sesión exitoso
      if (isLogin && response.data.message === 'Inicio de sesión exitoso') {
        navigate('/mascotas');
      }
    } catch (error) {
      // Muestra un mensaje de error si la solicitud falla
      setMessage(`Error de ${isLogin ? 'inicio de sesión' : 'registro'}. Verifica tus credenciales.`);
      console.error(`Error de ${isLogin ? 'inicio de sesión' : 'registro'}:`, error);
    }
  };

  // Renderiza el formulario de inicio de sesión o registro
  return (
    <div className="container mt-5">
      <div className="col-md-6 offset-md-3 auth-form">
        <h1>{isLogin ? 'Login' : 'Registro'}</h1>
        <form onSubmit={handleAuth}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {isLogin ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>
        {/* Muestra el mensaje de éxito o error */}
        {message && <p className="mt-3">{message}</p>}

        {/* Muestra enlaces para cambiar entre inicio de sesión y registro */}
        {isLogin ? (
          <p className="mt-3">
            No tienes una cuenta?{' '}
            <Link to="#" onClick={() => setIsLogin(false)}>
              Regístrate
            </Link>
          </p>
        ) : (
          <p className="mt-3">
            ¿Ya tienes una cuenta?{' '}
            <Link to="#" onClick={() => setIsLogin(true)}>
              Iniciar sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
