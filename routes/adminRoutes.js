

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminAuth() {
  const navigate = useNavigate();

  const [modo, setModo] = useState(""); // "", "login", "register", "forgot1", "forgot2"

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    celular: "",
    clave: "",
    nuevaClave: "",
    edad: "",
    dni: "",
    fechaNacimiento: "",
    domicilio: "",
    rol: "admin",
    foto: null,
  });

  // Manejo de cambios de input
  const handleChange = (e) => {
    if (e.target.name === "foto") {
      setForm({ ...form, foto: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  /* ===========================
        PETICIONES
  ============================ */

  // LOGIN
  const login = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        nombre: form.nombre,
        clave: form.clave,
        rol: form.rol,
      });
      console.log("RESPUESTA LOGIN:", res.data);

      // Guardar token y usuario en localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Inicio de sesión correcto");
      navigate("/admin/dashboard"); // Redirige al dashboard
    } catch (e) {
      console.error("ERROR LOGIN DETALLADO:", e);
      alert(e.response?.data?.msg || "Error en login");
    }
  };

  // REGISTER
    const register = async () => {
    try {
        const data = new FormData();

        // Campos de texto
        Object.keys(form).forEach((key) => {
        if (key !== "foto") data.append(key, form[key]);
        });

        // Archivo foto
        if (form.foto) {
        data.append("foto", form.foto);
        }

        const res = await axios.post("http://localhost:4000/api/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
        });

        alert("Usuario creado");
        setModo("");
    } catch (e) {
        console.error("ERROR REGISTER:", e);
        alert(e.response?.data?.msg || "Error al crear usuario");
    }
    };


  // OLVIDÉ MI CLAVE - PASO 1
  const forgot1 = async () => {
    try {
      await axios.post("http://localhost:4000/api/auth/forgot", {
        nombre: form.nombre,
        correo: form.correo,
        celular: form.celular,
      });
      alert("Identidad verificada, ingresar nueva clave");
      setModo("forgot2");
    } catch (e) {
      alert(e.response?.data?.msg || "Error al verificar datos");
    }
  };

  // OLVIDÉ MI CLAVE - PASO 2
  const forgot2 = async () => {
    try {
      await axios.post("http://localhost:4000/api/auth/reset", {
        correo: form.correo,
        nuevaClave: form.nuevaClave,
      });
      alert("Clave actualizada");
      setModo("");
    } catch (e) {
      alert(e.response?.data?.msg || "Error al actualizar clave");
    }
  };

  /* ===========================
        TARJETA IZQUIERDA
  ============================ */
  const TarjetaInicial = () => (
    <div className="bg-white shadow-xl border p-8 rounded-xl w-80 flex flex-col gap-3">
      <h2 className="text-xl font-bold mb-4 text-center">Panel Administrativo</h2>
      <button
        onClick={() => setModo("login")}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
      >
        Iniciar sesión
      </button>
      <button
        onClick={() => setModo("register")}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
      >
        Crear cuenta
      </button>
      <button
        onClick={() => setModo("forgot1")}
        className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800"
      >
        Olvidé mi clave
      </button>
    </div>
  );

  /* ===========================
        TARJETAS DERECHA
  ============================ */
  const tarjetas = {
    login: (
      <div className="bg-white shadow-xl border p-8 rounded-xl w-96 flex flex-col gap-3">
        <h2 className="text-xl font-semibold mb-4 text-center">Iniciar sesión</h2>

        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />

        <input
          name="clave"
          type="password"
          placeholder="Clave"
          value={form.clave}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />

        <select
          name="rol"
          value={form.rol}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        >
          <option value="admin">Admin</option>
          <option value="empleado">Empleado</option>
        </select>

        <button
          onClick={login}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Entrar
        </button>
      </div>
    ),

    register: (
      <div className="bg-white shadow-xl border p-8 rounded-xl w-[28rem] flex flex-col gap-3">
        <h2 className="text-xl font-semibold mb-4 text-center">Crear cuenta</h2>

        {[
          "nombre",
          "correo",
          "celular",
          "edad",
          "dni",
          
          "domicilio",
          "clave",
        ].map((campo) => (
          <input
            key={campo}
            name={campo}
            type={campo === "clave" ? "password" : "text"}
            placeholder={campo}
            value={form[campo]}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-3"
          />
        ))}

        {/* Input para FECHA en formato DD/MM/YYYY */}
        <input
          type="date" // calendario
          name="fechaNacimiento"
          value={form.fechaNacimiento}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />

        <input
          name="foto"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />


        <select
          name="rol"
          value={form.rol}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        >
          <option value="admin">Admin</option>
          <option value="empleado">Empleado</option>
        </select>

        <button
          onClick={register}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          Crear cuenta
        </button>
      </div>
    ),

    forgot1: (
      <div className="bg-white shadow-xl border p-8 rounded-xl w-96 flex flex-col gap-3">
        <h2 className="text-xl font-semibold mb-2 text-center">Olvidé mi clave</h2>
        <p className="text-gray-600 text-center mb-4">Paso 1: Verificar identidad</p>

        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />
        <input
          name="correo"
          placeholder="Correo"
          value={form.correo}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />
        <input
          name="celular"
          placeholder="Celular"
          value={form.celular}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />

        <button
          onClick={forgot1}
          className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800"
        >
          Verificar
        </button>
      </div>
    ),

    forgot2: (
      <div className="bg-white shadow-xl border p-8 rounded-xl w-96 flex flex-col gap-3">
        <h2 className="text-xl font-semibold mb-4 text-center">Nueva clave</h2>

        <input
          name="nuevaClave"
          type="password"
          placeholder="Nueva clave"
          value={form.nuevaClave}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-3"
        />

        <button
          onClick={forgot2}
          className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800"
        >
          Guardar nueva clave
        </button>
      </div>
    ),
  };

  /* ===========================
        RENDERIZADO
  ============================ */
  return (
    <div className="min-h-screen flex justify-center items-center gap-10 bg-gray-100">
      <TarjetaInicial />
      {modo !== "" && <div>{tarjetas[modo]}</div>}
    </div>
  );
}

//NUEVO CON SEGURIDAD

