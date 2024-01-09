  //IMPORT
  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import { mostrarAlerta } from "../functions.js";
  import Swal from 'sweetalert2';


  //CUERPO COMPONENTE
  const SolicitudesComponent = () => {
    const url = "http://localhost:8000/solicitudes"; 
    const url2 = "http://localhost:8000/mascotas"; 
    const url3 = "http://localhost:8000/solicitantes"; 
  
    const [solicitudes, setSolicitudes] = useState([]); 
    const [id, setId] = useState("");
    const [mascota_id, setMascota] = useState("");
    const [solicitante_id, setSolicitante] = useState("");
    const [fecha, setFecha] = useState("");
    const [estado, setEstado] = useState("");
    const [operacion, setOperacion] = useState("");
    const [titulo, setTitulo] = useState("");
    const solicitudesPorPagina = 9;
    const [paginaActual, setPaginaActual] = useState(1);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [mascotas, setMascotas] = useState([]);
    const [solicitantes, setSolicitantes] = useState([]);
    const fechaSolicitud = '2024-01-08';
  
    useEffect(() => {
      getMascotas();
      getSolicitudes();
      getSolicitantes();
    }, []);
  
  
    const getSolicitudes = async () => {
      try {
        const respuesta = await axios.get(`${url}/buscar`);
        console.log(respuesta); // Agrega esta línea
        console.log(respuesta.data);
    
        if (Array.isArray(respuesta.data.solicitud)) {
          setSolicitudes(respuesta.data.solicitud);
        } else {
          console.error("Formato de respuesta no válido: ", respuesta.data);
        }
      } catch (error) {
        console.error("Error al obtener datos de solicitudes: ", error);
      }
    };
    

    const getMascotas = async () => {
      try {
        const respuesta = await axios.get(`${url2}/buscar`);
        console.log(respuesta.data);

        // Verifica si la propiedad 'mascotas' es un array antes de establecerla
        if (Array.isArray(respuesta.data.mascotas)) {
          setMascotas(respuesta.data.mascotas);
        } else {
          // Maneja el caso en que 'mascotas' no es un array
          console.error("Formato de respuesta no válido: ", respuesta.data);
        }
      } catch (error) {
        console.error("Error al obtener datos: ", error);
      }
    };

    const getSolicitantes = async () => {
      try {
        const respuesta = await axios.get(`${url3}/buscar`);
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

    
  
    const openModal = (opcion, id, mascota_id, solicitante_id, fecha, estado) => {
      setId(id || '');
      setMascota(mascota_id || '');
      setSolicitante(solicitante_id || '');
      setFecha(fecha || '');
      setEstado(estado || '');
      setOperacion(opcion);
  
      if (opcion === 1) {
        setTitulo("Registrar Solicitud"); 
      } else if (opcion === 2) {
        setTitulo("Editar Solicitud"); 
        setId(id);
        setMascota(mascota_id);
        setSolicitante(solicitante_id);
        setFecha(fecha);
        setEstado(estado);
      }
    };
  
    const validar = () => {
      let parametros;
      let metodo;
  
      if (mascota_id.toString().trim() === '') {
        mostrarAlerta("Debe escribir el id de la mascota");
      } else if (solicitante_id.toString().trim() === '') {
        mostrarAlerta("Debe escribir el id del solicitante");
      } else if (!fecha) {
        mostrarAlerta("Debe establecer una fecha");
      } else if (estado.trim() === '') {
        mostrarAlerta("Debe colocar un estado");
      } else {
        if (operacion === 1) {
          parametros = {
            urlExt: `${url}/crear`,
            mascota_id: mascota_id.toString().trim(),
            solicitante_id: solicitante_id.toString().trim(),
            fecha: fecha,
            estado: estado.trim()
          };
          metodo = "POST";
        } else {
          parametros = {
            urlExt: `${url}/actualizar/${id}`,
            mascota_id: mascota_id.toString().trim(),
            solicitante_id: solicitante_id.toString().trim(),
            fecha: fecha,
            estado: estado.trim()
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
          getSolicitudes();
          getMascotas();
          getSolicitantes();
        }
      })
      .catch((error) => {
        mostrarAlerta(`Error en la solicitud`, error);
      });
    };
  
    const eliminarSolicitud = (id) => {
      Swal.fire({
        title: '¿Está seguro de eliminar a '+id+'?',
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

    const indexOfUltimaSolicitud = paginaActual * solicitudesPorPagina;
    const indexOfPrimeraSolicitud = indexOfUltimaSolicitud - solicitudesPorPagina;
    const solicitudesActuales = solicitudes.slice(indexOfPrimeraSolicitud, indexOfUltimaSolicitud);

    const paginacion = () => {
      const paginas = Math.ceil(solicitudes.length / solicitudesPorPagina);
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

    const openDetailsModal = (id, mascota_id, solicitante_id, fecha, estado) => {
      setSolicitudSeleccionada({
        id,
        mascota_id,
        solicitante_id,
        fecha,
        estado,
      });
      setTitulo("Detalles de la Solicitud");

      // Abre el modal de detalles
      document.getElementById('btnCerrarModal').click(); // Cierra el modal de edición
      document.getElementById('modalDetallesSolicitud').click(); // Abre el modal de detalles
    };

    useEffect(() => {
      console.log('Estado actualizado en useEffect:', solicitudSeleccionada);
      // Realizar acciones adicionales aquí después de la actualización del estado
      if (solicitudSeleccionada) {
        // Por ejemplo, abrir el modal después de que el estado se haya actualizado completamente
        document.getElementById('btnCerrarModal').click();
        document.getElementById('modalDetallesSolicitud').click();
      }
    }, [solicitudSeleccionada]);

    const renderizarSolicitudesPorPagina = () => {
      const filas = [];
      const solicitudesFiltradas = solicitudesActuales.filter((solicitud) =>
          solicitud && solicitud.mascota_id.toString().toLowerCase().includes(busqueda.toLowerCase())
      );
      const totalFilas = Math.ceil(solicitudesFiltradas.length / 3);

      for (let i = 0; i < totalFilas; i++) {
        const inicio = i * 3;
        const fin = inicio + 3;
        const solicitudesFila = solicitudesFiltradas.slice(inicio, fin);

        filas.push(
          <div key={i} className="row mt-3">
            {solicitudesFila.map((solicitud) => (
              <div key={solicitud.id} className="col-4">
                <div className="card" style={{ marginBottom: '20px', margin: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                  <div className="card-body">
                    <h5 className="card-title">
                    <strong>Mascota:</strong> {mascotas.find((mascota) => mascota.id === solicitud.mascota_id)?.nombre}</h5>
                    <p className="card-text">
                      <strong>Solicitante:</strong> {solicitantes.find((s) => s.id === solicitud.solicitante_id)?.nombre}<br />
                      <strong>Estado:</strong> {solicitud.estado}<br />
                    </p>
                    <button
                      onClick={() => openDetailsModal(solicitud.id, solicitud.mascota_id, solicitud.solicitante_id, solicitud.fecha, solicitud.estado)}
                      className="btn btn-info"
                      data-bs-toggle="modal"
                      data-bs-target="#modalDetallesSolicitud"
                    >
                      <i className="fa-solid fa-info"></i> Ver Detalles
                    </button>
                    <button onClick={() => eliminarSolicitud(solicitud.id)} className="btn btn-danger ml-2">
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
                  onClick={() => openModal(1)}
                  className="btn btn-dark"
                  data-bs-toggle="modal"
                  data-bs-target="#modalMascotas"
                >
                  <i className="fa-solid fa-circle-plus"></i>Añadir
                </button>
              </div>
            </div>
          </div>
          {/* Renderizado de solicitudes por página */}
          {renderizarSolicitudesPorPagina()}
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
                  <select
                    id="mascota_id"
                    className="form-control"
                    value={mascota_id}
                    onChange={(e) => setMascota(e.target.value)}
                  >
                    <option value="">Selecciona una mascota</option>
                    {mascotas.map((mascota) => (
                      <option key={mascota.id} value={mascota.id}>
                        {mascota.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa-solid fa-envelope"></i>
                  </span>
                  <select
                    id="solicitante_id"
                    className="form-control"
                    value={solicitante_id}
                    onChange={(e) => setSolicitante(e.target.value)}
                  >
                    <option value="">Selecciona a un solicitante</option>
                    {solicitantes.map((solicitante) => (
                      <option key={solicitante.id} value={solicitante.id}>
                        {solicitante.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa-solid fa-phone"></i>
                  </span>
                  <input
                    type="date"
                    id="fecha"
                    className="form-control"
                    placeholder="Fecha"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  ></input>
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa-solid fa-map-marker"></i>
                  </span>
                  <select
                    id="estado"
                    className="form-control"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Rechazada">Rechazada</option>
                  </select>
                </div>
                <div className="d-grid col-6 mx-auto">
                  <button onClick={() => validar()} className="btn btn-success">
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
        {/* Modal para detalles de la Solicitud */}
        <div className="modal fade" id="modalDetallesSolicitud" tabIndex="-1" aria-labelledby="modalDetallesSolicitudLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modalDetallesSolicitudLabel">Detalles de la solicitud</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
              
                {solicitudSeleccionada && (
                  console.log("holaaa2",solicitudSeleccionada.fecha),
                  <>
                  
                    <p><strong>ID Solicitud:</strong> {solicitudSeleccionada.id}</p>
                    <p><strong>ID Mascota:</strong> {solicitudSeleccionada.mascota_id}</p>
                    <p><strong>ID Solicitante:</strong> {solicitudSeleccionada.solicitante_id}</p>
                    <p><strong>Fecha:</strong> {new Date(fechaSolicitud).toLocaleDateString()}</p>
                    <p><strong>Estado:</strong> {solicitudSeleccionada.estado}</p>
                  </>
                )}
              </div>
              <div className="modal-footer"> 
                {/* Botón para editar solicitud */}
                <button
                  onClick={() => openModal(2, solicitudSeleccionada.id, solicitudSeleccionada.mascota_id, solicitudSeleccionada.solicitante_id, solicitudSeleccionada.fecha, solicitudSeleccionada.estado)}
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

  //EXPORT
  export default SolicitudesComponent;