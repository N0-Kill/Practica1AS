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
    .when("/equipos", {
        templateUrl: "/equipos",
        controller: "equiposCtrl"
    })

        
    .when("/equiposintegrantes", {
        templateUrl: "/equiposintegrantes",
        controller: "equiposintegrantesCtrl"
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
app.controller("equiposCtrl", function ($scope, $http) {
    function buscarEquipos() {
        $.get("/tbodyEquipos", function (trsHTML) {
            $("#tbodyEquipos").html(trsHTML)
        })
    }

    buscarEquipos()
    
    Pusher.logToConsole = true

    var pusher = new Pusher('85576a197a0fb5c211de', {
      cluster: 'us2'
    });

    var channel = pusher.subscribe("equiposchannel")
    channel.bind("equiposevent", function(data) {
       buscarEquipos()
    })


    $(document).on("submit", "#frmEquipo", function (event) {
        event.preventDefault()

        $.post("/equipo", {
            idEquipo: "",
            nombreEquipo: $("#txtEquipoNombre").val(),
        })
    })
})

 $(document).on("click", ".btnEliminarEquipo", function () {
        const id = $(this).data("id")

        if (confirm("¿Seguro que quieres eliminar este Equipo?")) {
        $.post("/equipo/eliminar", { id: id }, function () {
            // Elimina la fila del DOM
            $(`button[data-id='${id}']`).closest("tr").remove()
        }).fail(function () {
            alert("Error al eliminar el Team")
        })
    }
})

/////////////////////////////////// equiposIntegrantes

app.controller("equiposintegrantesCtrl", function ($scope, $http) {
    // Cargar equipos en el select
    function cargarEquipos() {
        $.get("/equipos/lista", function (equipos) {
            const $selectEquipo = $("#txtEquipo");
            $selectEquipo.empty();
            $selectEquipo.append('<option value="">Seleccionar equipo...</option>');
            equipos.forEach(function (equipo) {
                $selectEquipo.append(`<option value="${equipo.idEquipo}">${equipo.nombreEquipo}</option>`);
            });
        }).fail(function () {
            alert("Error al cargar equipos");
        });
    }

    // Cargar integrantes en el select
    function cargarIntegrantes() {
        $.get("/integrantes/lista", function (integrantes) {
            const $selectIntegrante = $("#txtIntegrante");
            $selectIntegrante.empty();
            $selectIntegrante.append('<option value="">Seleccionar integrante...</option>');
            integrantes.forEach(function (integrante) {
                $selectIntegrante.append(`<option value="${integrante.idIntegrante}">${integrante.nombreIntegrante}</option>`);
            });
        }).fail(function () {
            alert("Error al cargar integrantes");
        });
    }

    // Buscar equipos-integrantes
    function buscarEquiposIntegrantes() {
        $.get("/tbodyEquiposIntegrantes", function (trsHTML) {
            $("#tbodyEquiposIntegrantes").html(trsHTML);
        }).fail(function () {
            console.log("Error al cargar equipos-integrantes");
        });
    }

    // Inicializar
    cargarEquipos();
    cargarIntegrantes();
    buscarEquiposIntegrantes();

    // Pusher
    Pusher.logToConsole = true;
    var pusher = new Pusher('85576a197a0fb5c211de', { cluster: 'us2' });
    var channel = pusher.subscribe("equiposIntegranteschannel");
    channel.bind("equiposIntegrantesevent", function (data) {
        buscarEquiposIntegrantes();
    });

    // Insertar Equipo-Integrante (ojo: id correcto del form)
    $(document).on("submit", "#frmEquipoIntegrante", function (event) {
        event.preventDefault();

        const idEquipo = $("#txtEquipo").val();
        const idIntegrante = $("#txtIntegrante").val();

        if (!idEquipo) {
            alert("Por favor selecciona un equipo");
            return;
        }
        if (!idIntegrante) {
            alert("Por favor selecciona un integrante");
            return;
        }

        $.post("/equiposintegrantes", {
            idEquipoIntegrante: "",
            idEquipo: idEquipo,
            idIntegrante: idIntegrante
        }).done(function () {
            $("#frmEquipoIntegrante")[0].reset();
            alert("Integrante asignado al equipo correctamente");
            buscarEquiposIntegrantes();
        }).fail(function () {
            alert("Error al guardar integrante-equipo");
        });
    });
});

// Eliminar integrante-equipo
$(document).on("click", ".btnEliminarIntegranteEquipo", function () {
    const id = $(this).data("id");

    if (confirm("¿Seguro que quieres eliminar este registro?")) {
        $.post("/equipointegrante/eliminar", { id: id }, function () {
            $(`button[data-id='${id}']`).closest("tr").remove();
        }).fail(function () {
            alert("Error al eliminar el registro");
        });
    }
});

//////////////////////////////////////////////////////////

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





