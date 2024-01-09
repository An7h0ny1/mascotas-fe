import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export function mostrarAlerta(mensaje, icon, foco = ''){
    onfocus(foco);
    const MySwal = withReactContent(Swal);
    MySwal.fire({
        position: "top-end",
        icon: icon,
        title: mensaje,
        showConfirmButton: false,
        timer: 1500
    });
}

function onfocus(foco){
    if(foco !== ''){
        document.getElementById(foco).focus();
    }
}