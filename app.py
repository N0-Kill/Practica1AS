# python.exe -m venv .venv
# cd .venv/Scripts
# activate.bat
# py -m ensurepip --upgrade
# pip install -r requirements.txt

from flask import Flask

from flask import render_template
from flask import request
from flask import jsonify, make_response
from equipos_service import equipos_bp 

import mysql.connector
import pusher
import datetime
import pytz

from flask_cors import CORS, cross_origin

con = mysql.connector.connect(
    host="185.232.14.52",
    database="u760464709_23005014_bd",
    user="u760464709_23005014_usr",
    password="B|7k3UPs3&P"
)

app = Flask(__name__)
CORS(app)

app.register_blueprint(equipos_bp)

def pusherIntegrantes():
    pusher_client = pusher.Pusher(
        app_id='2048639',
        key='85576a197a0fb5c211de',
        secret='bbd4afc18e15b3760912',
        cluster='us2',
        ssl=True
    )
    
    pusher_client.trigger('integranteschannel', 'integrantesevent', {'message': 'hello world'})
    return make_response(jsonify({}))

def pusherEquipos():
    pusher_client = pusher.Pusher(
        app_id='2048639',
        key='85576a197a0fb5c211de',
        secret='bbd4afc18e15b3760912',
        cluster='us2',
        ssl=True
    )
    
    pusher_client.trigger('equiposchannel', 'equiposevent', {'message': 'hello world'})
    return make_response(jsonify({}))

def pusherEquiposIntegrantes():
    pusher_client = pusher.Pusher(
        app_id='2048639',
        key='85576a197a0fb5c211de',
        secret='bbd4afc18e15b3760912',
        cluster='us2',
        ssl=True
    )
    pusher_client.trigger('equiposIntegranteschannel', 'equiposIntegrantesevent', {'message': 'hello Equipos Integrantes'})
    return make_response(jsonify({}))

@app.route("/")
def index():
    if not con.is_connected():
        con.reconnect()

    con.close()

    return render_template("index.html")

@app.route("/app")
def app2():
    if not con.is_connected():
        con.reconnect()
    con.close()

    return render_template("login.html")
    # return "<h5>Hola, soy la view app</h5>"

@app.route("/iniciarSesion", methods=["POST"])
def iniciarSesion():
    if not con.is_connected():
        con.reconnect()

    usuario    = request.form["txtUsuario"].strip()
    contrasena = request.form["txtContrasena"].strip()

    cursor = con.cursor(dictionary=True)
    sql    = """
    SELECT IdUsuario
    FROM usuarios
    
    WHERE Nombre = %s 
    AND Contrasena = %s
    """
    val = (usuario, contrasena)

    cursor.execute(sql, val)
    registros = cursor.fetchall()
    con.close()

    return make_response(jsonify(registros))

#////////////////////////////////////////////////////////////////////////////////////////

@app.route("/integrantes")
def productos():
    return render_template("integrantes.html")


@app.route("/tbodyIntegrantes")
def tbodyProductos():
    if not con.is_connected():
        con.reconnect()

    cursor = con.cursor(dictionary=True)
    sql    = """
    SELECT idIntegrante,
           nombreIntegrante

    FROM integrantes

    ORDER BY idIntegrante DESC

    LIMIT 10 OFFSET 0
    """

    cursor.execute(sql)
    registros = cursor.fetchall()
    
    return render_template("tbodyIntegrantes.html", integrantes=registros)

@app.route("/integrantes/buscar", methods=["GET"])
def buscarIntegrantes():
    if not con.is_connected():
        con.reconnect()

    args     = request.args
    busqueda = args["busqueda"]
    busqueda = f"%{busqueda}%"

    cursor = con.cursor(dictionary=True)
    sql    = """
    SELECT idIntegrante,
           nombreIntegrante

    FROM integrantes

    WHERE nombreIntegrante LIKE %s

    ORDER BY idIntegrante DESC

    LIMIT 10 OFFSET 0
    """
    val = (busqueda,)

    try:
        cursor.execute(sql, val)
        registros = cursor.fetchall()

    except mysql.connector.errors.ProgrammingError as error:
        print(f"Ocurrió un error de programación en MySQL: {error}")
        registros = []

    finally:
        con.close()

    return make_response(jsonify(registros))


@app.route("/integrante", methods=["POST"])
def guardarIntegrante():
    if not con.is_connected():
        con.reconnect()

    idIntegrante = request.form["idIntegrante"]
    nombreIntegrante = request.form["nombreIntegrante"]

    cursor = con.cursor()

    if idIntegrante:
        sql = """
        UPDATE integrantes
        SET nombreIntegrante = %s
        WHERE idIntegrante = %s
        """
        val = (nombreIntegrante, idIntegrante)
    else:
        sql = """
        INSERT INTO integrantes (nombreIntegrante)
        VALUES (%s)
        """
        val = (nombreIntegrante,)

    cursor.execute(sql, val)
    con.commit()
    con.close()

    pusherIntegrantes()
    return make_response(jsonify({"mensaje": "Integrante guardado"}))


@app.route("/test-event")
def test_event():
    pusherIntegrantes()
    return "Evento disparado"

#////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@app.route("/proyectosavances/proyectos/<int:id>")
def productos2(id):
    if not con.is_connected():
        con.reconnect()

    cursor = con.cursor(dictionary=True)
    sql    = """
    SELECT productos.Nombre_Producto, ingredientes.*, productos_ingredientes.Cantidad FROM productos_ingredientes
    INNER JOIN productos ON productos.Id_Producto = productos_ingredientes.Id_Producto
    INNER JOIN ingredientes ON ingredientes.Id_Ingrediente = productos_ingredientes.Id_Ingrediente
    WHERE productos_ingredientes.Id_Producto = %s
    ORDER BY productos.Nombre_Producto
    """

    cursor.execute(sql, (id, ))
    registros = cursor.fetchall()

    return render_template("modal.html", productosIngredientes=registros)

#////////////////////////////////////////////////////////////////////////////////////////////////////////////////

#/////////////////////////////////////////Equipozz//////////////////////////////////////////////////////

#////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@app.route("/equiposintegrantes")
def equiposintegrantes():
    return render_template("equiposintegrantes.html")

@app.route("/tbodyEquiposIntegrantes")
def tbodyEquiposIntegrantes():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
                ei.idEquipoIntegrante,
                e.nombreEquipo,
                i.nombreIntegrante,
                ei.fechaUnion
        FROM equiposintegrantes ei
        INNER JOIN equipos e 
                ON e.idEquipo = ei.idEquipo
        INNER JOIN integrantes i 
                ON i.idIntegrante = ei.idIntegrante
        ORDER BY ei.idEquipoIntegrante DESC
        LIMIT 10 OFFSET 0
    """
    cursor.execute(sql)
    registros = cursor.fetchall()

    cursor.close()
    conn.close()
    return render_template("tbodyEquiposIntegrantes.html", equiposintegrantes=registros)

@app.route("/equiposintegrantes/buscar", methods=["GET"])
def buscarEquiposIntegrantes():
    if not con.is_connected():
        con.reconnect()

    args     = request.args
    busqueda = args["busqueda"]
    busqueda = f"%{busqueda}%"

    cursor = con.cursor(dictionary=True)
    sql    = """

    SELECT ei.idEquipoIntegrante, e.nombreEquipo, i.nombreIntegrante
    FROM equiposintegrantes ei
    INNER JOIN equipos e ON e.idEquipo = ei.idEquipo
    INNER JOIN integrantes i ON i.idIntegrante = ei.idIntegrante
    ORDER BY ei.idEquipoIntegrante DESC
    LIMIT 10 OFFSET 0
    
    """
    val = (busqueda,)

    try:
        cursor.execute(sql, val)
        registros = cursor.fetchall()

    except mysql.connector.errors.ProgrammingError as error:
        print(f"Ocurrió un error de programación en MySQL: {error}")
        registros = []

    finally:
        con.close()

    return make_response(jsonify(registros))

@app.route("/equiposintegrantes", methods=["POST"])
def guardarEquiposIntegrantes():
    if not con.is_connected():
        con.reconnect()

    idEquipoIntegrante = request.form["idEquipoIntegrante"]
    idEquipo = request.form["idEquipo"]
    idIntegrante = request.form["idIntegrante"]
    
    cursor = con.cursor()

    if idEquipoIntegrante:
        sql = """
        UPDATE equiposintegrantes
        SET idEquipo = %s,
            idIntegrante = %s,
            fechaHora = NOW()
        WHERE idEquipoIntegrante = %s
        """
        val = (idEquipo, idIntegrante, idEquipoIntegrante)
    else:
        sql = """
        INSERT INTO equiposintegrantes (idEquipo, idIntegrante, fechaHora)
        VALUES (%s, %s, NOW())
        """
        val = (idEquipo, idIntegrante)

    cursor.execute(sql, val)
    con.commit()
    con.close()

    pusherEquiposIntegrantes()
    return make_response(jsonify({"mensaje": "EquipoIntegrante guardado"}))

@app.route("/equiposintegrantes/eliminar", methods=["POST"])
def eliminarequiposintegrantes():
    if not con.is_connected():
        con.reconnect()

    id = request.form.get("id")

    cursor = con.cursor(dictionary=True)
    sql = """
    DELETE FROM equiposintegrantes 
    WHERE idEquipoIntegrante = %s
    """
    val = (id,)
    
    cursor.execute(sql, val)
    con.commit()
    con.close()

    pusherEquiposIntegrantes()
    return make_response(jsonify({"mensaje": "Equipo Integrante eliminado"}))

@app.route("/equipos/lista")
def cargarEquipos():
    if not con.is_connected():
        con.reconnect()

    cursor = con.cursor(dictionary=True)
    sql = """
    SELECT idEquipo, nombreEquipo
    FROM equipos
    ORDER BY nombreEquipo ASC
    """
    
    cursor.execute(sql)
    registros = cursor.fetchall()
    con.close()
    
    return make_response(jsonify(registros))

@app.route("/integrantes/lista")
def cargarIntegrantes():
    if not con.is_connected():
        con.reconnect()

    cursor = con.cursor(dictionary=True)
    sql = """
    SELECT idIntegrante , nombreIntegrante 
    FROM integrantes
    ORDER BY nombreIntegrante ASC
    """
    
    cursor.execute(sql)
    registros = cursor.fetchall()
    con.close()
    
    return make_response(jsonify(registros))
    
#////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if __name__ == "__main__":
    app.run(debug=True, port=5000)




