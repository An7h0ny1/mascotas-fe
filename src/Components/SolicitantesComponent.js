  // IMPORT
import React, { useEffect, useState } from "react";
import axios from "axios";
import { mostrarAlerta } from "../functions.js";
import Swal from 'sweetalert2';

// CUERPO COMPONENTE
const SolicitantesComponent = () => {
  const url = "http://localhost:8000/solicitantes";

  const [solicitantes, setSolicitantes] = useState([]);
  const [id, setId] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [operacion, setOperacion] = useState("");
  const [titulo,setTitulo]=useState("");
  const solicitantesPorPagina = 9;
  const [paginaActual, setPaginaActual] = useState(1);
  const [solicitanteSeleccionado, setSolicitanteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    getSolicitantes();
  }, []);


  const getSolicitantes = async () => {
    try {
      const respuesta = await axios.get(`${url}/buscar`);
      console.log(respuesta.data);

      if (Array.isArray(respuesta.data.persona)) {
        setSolicitantes(respuesta.data.persona);
      } else {
        console.error("Formato de respuesta no válido: ", respuesta.data);
      }
    } catch (error) {
      console.error("Error al obtener datos de solicitantes: ", error);
    }
  };

  const openModal = (opcion, id, nombre, correo, telefono, direccion) => {
    setId(id || '');
    setNombre(nombre || '');
    setCorreo(correo || '');
    setTelefono(telefono || '');
    setDireccion(direccion || '');
    setOperacion(opcion);

    if (opcion === 1) {
      setTitulo("Registrar Solicitante");
    } else if (opcion === 2) {
      setTitulo("Editar Solicitante");
      setId(id);
      setNombre(nombre);
      setCorreo(correo);
      setTelefono(telefono);
      setDireccion(direccion);
    }
  };

  const validar = () => {
    let parametros;
    let metodo;

    if (nombre.trim() === '') {
      console.log("Debe escribir un Nombre");
      mostrarAlerta("Debe escribir un Nombre");
    } else if (correo.trim() === '') {
      mostrarAlerta("Debe escribir un Correo");
    } else if (telefono.toString().trim() === '') {
      console.log("Debe escribir un Teléfono");
      mostrarAlerta("Debe escribir un Teléfono");
    } else if (direccion.trim() === '') {
      mostrarAlerta("Debe escribir una Dirección");
    } else {
      if (operacion === 1) {
        parametros = {
          urlExt: `${url}/crear`,
          nombre: nombre.trim(),
          correo: correo.trim(),
          telefono: telefono.toString().trim(),
          direccion: direccion.trim()
        };
        metodo = "POST";
      } else {
        parametros = {
          urlExt: `${url}/actualizar/${id}`,
          nombre: nombre.trim(),
          correo: correo.trim(),
          telefono: telefono.toString().trim(),
          direccion: direccion.trim()
        };
        metodo = "PUT";
      }
      enviarSolicitud(metodo, parametros);
    }
  };

  const enviarSolicitud = async (metodo, parametros) => {
    await axios({method: metodo, url: parametros.urlExt, data: parametros })
    .then((respuesta) => {
      let tipo = respuesta.data.tipo;
      let mensaje = respuesta.data.mensaje;
      mostrarAlerta(mensaje, tipo);
      if (tipo === "success") {
        document.getElementById("btnCerrarModal").click();
        getSolicitantes();
      }
    })
    .catch((error) => {
      mostrarAlerta(`Error en la solicitud`, error);
    });
  };

  const eliminarSolicitante = (id, nombre) => {
    Swal.fire({
      title: '¿Está seguro de eliminar a '+nombre+'?',
      text: "No podrá revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        setId(id);
        enviarSolicitud('DELETE',{urlExt: `${url}/eliminar/${id}`});
      }
    });
  };


  const indexOfUltimoSolicitante = paginaActual * solicitantesPorPagina;
  const indexOfPrimerSolicitante = indexOfUltimoSolicitante - solicitantesPorPagina;
  const solicitantesActuales = solicitantes.slice(indexOfPrimerSolicitante, indexOfUltimoSolicitante);
  
  const paginacion = () => {
    const paginas = Math.ceil(solicitantes.length / solicitantesPorPagina);
    const numerosPagina = [];
  
    for (let i = 1; i <= paginas; i++) {
      numerosPagina.push(i);
    }
  
    return (
      <nav>
        <ul className="pagination">
          {numerosPagina.map((numero) => (
            <li key={numero} className={`page-item ${numero === paginaActual ? 'active' : ''}`}>
              <button onClick={() => setPaginaActual(numero)} className="page-link">
                {numero}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };
  
  const openDetailsModal = (id, nombre, correo, telefono, direccion) => {
    setSolicitanteSeleccionado({
      id,
      nombre,
      correo,
      telefono,
      direccion,
    });
    setTitulo("Detalles del Solicitante");
  
    // Abre el modal de detalles
    document.getElementById('btnCerrarModal').click(); // Cierra el modal de edición
    document.getElementById('modalDetallesSolicitante').click(); // Abre el modal de detalles
  };
  
  useEffect(() => {
    console.log('Estado actualizado en useEffect:', solicitanteSeleccionado);
    // Realizar acciones adicionales aquí después de la actualización del estado
    if (solicitanteSeleccionado) {
      // Por ejemplo, abrir el modal después de que el estado se haya actualizado completamente
      document.getElementById('btnCerrarModal').click();
      document.getElementById('modalDetallesSolicitante').click();
    }
  }, [solicitanteSeleccionado]);
  
  const renderizarSolicitantesPorPagina = () => {
    const filas = [];
    const solicitantesFiltrados = solicitantesActuales.filter((solicitante) =>
        solicitante.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    const totalFilas = Math.ceil(solicitantesFiltrados.length / 3);
    
    for (let i = 0; i < totalFilas; i++) {
        const inicio = i * 3;
        const fin = inicio + 3;
        const solicitantesFila = solicitantesFiltrados.slice(inicio, fin);
  
      filas.push(
        <div key={i} className="row mt-3">
          {solicitantesFila.map((solicitante) => (
            <div key={solicitante.id} className="col-4">
              <div className="card" style={{ marginBottom: '20px', margin: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <div className="card-body">
                  <h5 className="card-title">{solicitante.nombre}</h5>
                  <p className="card-text">
                    <strong>Teléfono:</strong> {solicitante.telefono}<br />
                  </p>
                  <button
                    onClick={() => openDetailsModal(solicitante.id, solicitante.nombre, solicitante.correo, solicitante.telefono, solicitante.direccion)}
                    className="btn btn-info"
                    data-bs-toggle="modal"
                    data-bs-target="#modalDetallesSolicitante"
                  >
                    <i className="fa-solid fa-info"></i> Ver Detalles
                  </button>
                    <button onClick={() => eliminarSolicitante(solicitante.id, solicitante.nombre)} className="btn btn-danger ml-2">
                      <i className="fa-solid fa-trash"></i> Eliminar
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return filas;
  };
    
    
  return (
    <div className="App">
      <div className="container-fluid">
        <div className="row mt-3">
          <div className="col-md-4 offset-md-4">
          <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fa-solid fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar solicitante"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="d-grid mx-auto">
              <button
                onClick={()=>openModal(1)}
                className="btn btn-dark"
                data-bs-toggle="modal"
                data-bs-target="#modalMascotas"
              >
                <i className="fa-solid fa-circle-plus"></i>Añadir
              </button>
            </div>
          </div>
        </div>
        {/* Renderizado de solicitantes por página */}
        {renderizarSolicitantesPorPagina()}
        {/* Paginación */}
        {paginacion()}
      </div>
      {/* Modal para solicitudes */}
      <div id="modalMascotas" className="modal fade" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <label className="h5">{titulo}</label>
            </div>
            <div className="modal-body">
              <input type="hidden" id="id"></input>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-user"></i>
                </span>
                <input
                  type="text"
                  id="nombre"
                  className="form-control"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e)=>setNombre(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <input
                  type="email"
                  id="correo"
                  className="form-control"
                  placeholder="Correo"
                  value={correo}
                  onChange={(e)=>setCorreo(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-phone"></i>
                </span>
                <input
                  type="text"
                  id="telefono"
                  className="form-control"
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e)=>setTelefono(e.target.value)}
                ></input>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-map-marker"></i>
                </span>
                <input
                  type="text"
                  id="direccion"
                  className="form-control"
                  placeholder="Dirección"
                  value={direccion}
                  onChange={(e)=>setDireccion(e.target.value)}
                ></input>
              </div>
              <div className="d-grid col-6 mx-auto">
                <button onClick={()=>validar()} className="btn btn-success">
                  <i className="fa-solid fa-floppy-disk"></i>Guardar
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                id="btnCerrarModal"
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal para detalles de la mascota */}
      <div className="modal fade" id="modalDetallesSolicitante" tabIndex="-1" aria-labelledby="modalDetallesSolicitanteLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalDetallesSolicitanteLabel">Detalles del Solicitante</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {solicitanteSeleccionado && (
                  <>
                    <p><strong>ID:</strong> {solicitanteSeleccionado.id}</p>
                    <p><strong>Nombre:</strong> {solicitanteSeleccionado.nombre}</p>
                    <p><strong>Correo:</strong> {solicitanteSeleccionado.correo}</p>
                    <p><strong>Telefono:</strong> {solicitanteSeleccionado.telefono}</p>
                    <p><strong>Direccion:</strong> {solicitanteSeleccionado.direccion}</p>

                  </>
                )}
            </div>
            <div className="modal-footer">
              {/* Botón para editar solicitante */}
              <button
                onClick={() => openModal(2, solicitanteSeleccionado.id, solicitanteSeleccionado.nombre, solicitanteSeleccionado.correo, solicitanteSeleccionado.telefono, solicitanteSeleccionado.direccion)}
                className="btn btn-warning"
                data-bs-toggle="modal"
                data-bs-target="#modalMascotas"
              >
                <i className="fa-solid fa-edit"></i> Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// EXPORT
export default SolicitantesComponent;