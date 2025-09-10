function activeMenuOption(href) {
    $(".app-menu .nav-link")
    .removeClass("active")
    .removeAttr('aria-current')

    $(`[href="${(href ? href : "#/")}"]`)
    .addClass("active")
    .attr("aria-current", "page")
}

const app = angular.module("angularjsApp", ["ngRoute"])
app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix("")

    $routeProvider
    .when("/", {
        templateUrl: "/app",
        controller: "appCtrl"
    })
    .when("/integrantes", {
        templateUrl: "/integrantes",
        controller: "integrantesCtrl"
    })



        
    .when("/equiposintegrantes", {
        templateUrl: "/equiposintegrantes",
        controller: "equiposintegrantesCtrl"
    })
    .when("/equipos", {
        templateUrl: "/equipos",
        controller: "equiposCtrl"
    })
    .when("/proyectos", {
        templateUrl: "/proyectos",
        controller: "proyectosCtrl"
    })
    .when("/proyectosavances", {
        templateUrl: "/proyectosavances",
        controller: "proyectosavancesCtrl"
    })
    .otherwise({
        redirectTo: "/"
    })
})
app.run(["$rootScope", "$location", "$timeout", function($rootScope, $location, $timeout) {
    function actualizarFechaHora() {
        lxFechaHora = DateTime
        .now()
        .setLocale("es")

        $rootScope.angularjsHora = lxFechaHora.toFormat("hh:mm:ss a")
        $timeout(actualizarFechaHora, 1000)
    }

    $rootScope.slide = ""

    actualizarFechaHora()

    $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
        $("html").css("overflow-x", "hidden")
        
        const path = current.$$route.originalPath

        if (path.indexOf("splash") == -1) {
            const active = $(".app-menu .nav-link.active").parent().index()
            const click  = $(`[href^="#${path}"]`).parent().index()

            if (active != click) {
                $rootScope.slide  = "animate__animated animate__faster animate__slideIn"
                $rootScope.slide += ((active > click) ? "Left" : "Right")
            }

            $timeout(function () {
                $("html").css("overflow-x", "auto")

                $rootScope.slide = ""
            }, 1000)

            activeMenuOption(`#${path}`)
        }
    })
}])


///////////////// App Controller
app.controller("appCtrl", function ($scope, $http) {
    $("#frmInicioSesion").submit(function (event) {
        event.preventDefault()
        $.post("iniciarSesion", $(this).serialize(), function (respuesta) {
            if (respuesta.length) {
                window.location = "/#/integrantes"
                
                return
            }

             alert("Usuario y/o Contraseña Incorrecto(s)")
        })
    })
})


///////////////// integrantes controller
app.controller("integrantesCtrl", function ($scope, $http) {
    function buscarIntegrantes() {
        $.get("/tbodyIntegrantes", function (trsHTML) {
            $("#tbodyIntegrantes").html(trsHTML)
        })
    }

    buscarIntegrantes()
    
    Pusher.logToConsole = true

    var pusher = new Pusher('85576a197a0fb5c211de', {
      cluster: 'us2'
    });

    var channel = pusher.subscribe("integranteschannel")
    channel.bind("integrantesevent", function(data) {
       buscarIntegrantes()
    })


    $(document).on("submit", "#frmIntegrante", function (event) {
        event.preventDefault()

        $.post("/integrante", {
            idIntegrante: "",
            nombreIntegrante: $("#txtNombreIntegrante").val(),
        })
    })
})


///////////////// proyectos controller

app.controller("proyectosCtrl", function ($scope, $http) {
    function buscarIntegrantes() {
        $.get("/tbodyProyectos", function (trsHTML) {
            $("#tbodyProyectos").html(trsHTML)
        })
    }

    buscarProyectos()
    
    Pusher.logToConsole = true

    var pusher = new Pusher('85576a197a0fb5c211de', {
      cluster: 'us2'
    });

    var channel = pusher.subscribe("proyectoschannel")
    channel.bind("proyectosevent", function(data) {
       buscarProyectos()
    })


    $(document).on("submit", "#frmProyectos", function (event) {
        event.preventDefault()

        $.post("/proyecto", {
            idProyecto: "",
            NombreProyecto: $("#txtNombreProyecto").val(),
            Equipo: $("#txtEquipo").val(),
            Objetivo: $("#txtObjetivo").val(),
            Estado: $("#txtEstado").val(),
            
        })
    })
})


////////////////////////////////////////////////////////////

app.controller("productosCtrl", function ($scope, $http) {
    function buscarProductos() {
        $.get("/tbodyProductos", function (trsHTML) {
            $("#tbodyProductos").html(trsHTML)
        })
    }

    buscarProductos()
    
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true

    var pusher = new Pusher('85576a197a0fb5c211de', {
      cluster: 'us2'
    });

    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function(data) {
        // alert(JSON.stringify(data))
    })

    $(document).on("submit", "#frmProducto", function (event) {
        event.preventDefault()

        $.post("/producto", {
            id: "",
            nombre: $("#txtNombre").val(),
            precio: $("#txtPrecio").val(),
            existencias: $("#txtExistencias").val(),
        })
    })

    $(document).on("click", ".btn-ingredientes", function (event) {
        const id = $(this).data("id")

        $.get(`/proyectosavances/proyectos/${id}`, function (html) {
            modal(html, "Proyectos", [
                {html: "Aceptar", class: "btn btn-secondary", fun: function (event) {
                    closeModal()
                }}
            ])
        })
    })
})

app.controller("decoracionesCtrl", function ($scope, $http) {
    function buscarDecoraciones() {
        $.get("/tbodyDecoraciones", function (trsHTML) {
            $("#tbodyDecoraciones").html(trsHTML)
        })
    }

    buscarDecoraciones()
    
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true

    var pusher = new Pusher("e57a8ad0a9dc2e83d9a2", {
      cluster: "us2"
    })

    var channel = pusher.subscribe("canalProductos")
    channel.bind("eventoDecoraciones", function(data) {
        // alert(JSON.stringify(data))
        buscarDecoraciones()
    })

    $(document).on("submit", "#frmDecoracion", function (event) {
        event.preventDefault()

        $.post("/decoracion", {
            id: "",
            nombre: $("#txtNombre").val(),
            precio: $("#txtPrecio").val(),
            existencias: $("#txtExistencias").val(),
        })
    })
})


const DateTime = luxon.DateTime
let lxFechaHora

document.addEventListener("DOMContentLoaded", function (event) {
    const configFechaHora = {
        locale: "es",
        weekNumbers: true,
        // enableTime: true,
        minuteIncrement: 15,
        altInput: true,
        altFormat: "d/F/Y",
        dateFormat: "Y-m-d",
        // time_24hr: false
    }

    activeMenuOption(location.hash)
})
