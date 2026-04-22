import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBLuznihWSbkP6dF0A01EhgFt0Kf8cK06c",
    authDomain: "stock-app-af0b7.firebaseapp.com",
    databaseURL: "https://stock-app-af0b7-default-rtdb.firebaseio.com",
    projectId: "stock-app-af0b7",
    storageBucket: "stock-app-af0b7.firebasestorage.app",
    messagingSenderId: "192065775274",
    appId: "1:192065775274:web:a91bb277174c2f5a4952d3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const productosRef = ref(db, 'productos');

let productos = [];
let editandoIndex = null; 

const modal = document.getElementById('modal-entrada');
const btnAbrir = document.getElementById('btn-nueva-entrada');
const btnCerrar = document.getElementById('btn-cerrar');
const formEntrada = document.getElementById('form-entrada');
const listaProductos = document.getElementById('lista-productos');
const inputBusqueda = document.getElementById('input-busqueda');

// ESCUCHAR CAMBIOS EN FIREBASE
onValue(productosRef, (snapshot) => {
    const data = snapshot.val();
    productos = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
    renderStock();
});

const renderStock = () => {
    listaProductos.innerHTML = ''; 
    productos.forEach((prod, index) => {
        if (!prod) return;
        const colorStock = prod.stock < 5 ? '#ff4b2b' : '#00adb5';
        listaProductos.innerHTML += `
            <tr>
                <td><strong>${prod.sku}</strong></td>
                <td>${prod.nombre}</td>
                <td>${prod.talle}</td>
                <td>${prod.color}</td>
                <td style="color: ${colorStock}; font-weight: bold;">${prod.stock}</td>
                <td>$ ${Number(prod.precio).toLocaleString()}</td>
                <td>
                    <button class="btn-accion" onclick="prepararEdicion(${index})">⚙️</button>
                    <button class="btn-accion" onclick="eliminarProducto(${index})">🗑️</button>
                </td>
            </tr>`;
    });
    actualizarTotales();
};

const actualizarTotales = () => {
    const validos = productos.filter(p => p !== null);
    const totalCtd = validos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
    const totalPlata = validos.reduce((acc, p) => acc + ((Number(p.stock) || 0) * (Number(p.precio) || 0)), 0);
    document.getElementById('total-articulos').innerText = totalCtd;
    document.getElementById('valor-total').innerText = `$ ${totalPlata.toLocaleString()}`;
};

// MODAL
btnAbrir.onclick = () => {
    editandoIndex = null;
    document.querySelector('.modal-content h2').innerText = "Nueva Entrada de Stock";
    formEntrada.reset();
    modal.style.display = 'block';
};
btnCerrar.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

// GUARDAR
formEntrada.onsubmit = (e) => {
    e.preventDefault();
    const datos = {
        sku: document.getElementById('sku-input').value.toUpperCase(),
        nombre: document.getElementById('nombre-input').value,
        talle: document.getElementById('talle-input').value || 'N/A',
        color: document.getElementById('color-input').value || 'Surtido', 
        stock: parseInt(document.getElementById('cantidad-input').value),
        precio: parseFloat(document.getElementById('precio-input').value)
    };

    let nuevos = [...productos.filter(p => p !== null)];
    if (editandoIndex !== null) nuevos[editandoIndex] = datos;
    else nuevos.push(datos);

    set(productosRef, nuevos).then(() => {
        modal.style.display = 'none';
        formEntrada.reset();
    });
};

// FUNCIONES GLOBALES
window.prepararEdicion = (index) => {
    const p = productos[index];
    editandoIndex = index;
    document.getElementById('sku-input').value = p.sku;
    document.getElementById('nombre-input').value = p.nombre;
    document.getElementById('talle-input').value = p.talle;
    document.getElementById('color-input').value = p.color;
    document.getElementById('cantidad-input').value = p.stock;
    document.getElementById('precio-input').value = p.precio;
    document.querySelector('.modal-content h2').innerText = "Editar Producto";
    modal.style.display = 'block';
};

window.eliminarProducto = (index) => {
    if(confirm('¿Eliminar artículo?')) {
        const nuevos = productos.filter((_, i) => i !== index);
        set(productosRef, nuevos);
    }
};

// BUSCADOR
inputBusqueda.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#lista-productos tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
});