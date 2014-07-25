function main(){
    if ((typeof cordova == 'undefined') && (typeof Cordova == 'undefined')) alert('Error. Vuelva a intentarlo');
            if (typeof CDV == 'undefined') alert('Error. Vuelva a intentarlo');
            if (typeof FB == 'undefined') alert('Error. Vuelva a intentarlo');
            
            FB.Event.subscribe('auth.login', function(response) {
                               //alert('auth.login event');
                               //alert("ya esta logeado");
                               //me();
                               });
            
            FB.Event.subscribe('auth.logout', function(response) {
                               //alert('auth.logout event');
                               });
            
            FB.Event.subscribe('auth.sessionChange', function(response) {
                               //alert('auth.sessionChange event');
                               });
            
            FB.Event.subscribe('auth.statusChange', function(response) {
                               //alert('auth.statusChange event');
                               });
    FB.init({ appId: "1536370399923784", nativeInterface: CDV.FB, useCachedDialogs: false });

    var update;
    if(window.localStorage.getItem("lastUpdate")){
        update = window.localStorage.getItem("lastUpdate");
    }else{
        update = "2014-07-07 08:02:51"; //fecha de lanzamiento de la app. O ultimo update al store.
        window.localStorage.setItem("lastUpdate",update);
    }
    //alert(update);
    var idExamen = 0; 
    var numPreg = 0;
    var eleccion; // Selección de la respuesta del usuario.
    var nameExamen = "";
    var totalPreg = 0; //HACER VARIABLE
    var pausa = false; //Pausar el tiempo que tiene el usuario para responder
    var idEvaluacion = 0;
    var idUsuario = window.localStorage.getItem("userID"); 
    var userName = window.localStorage.getItem("userName");
    var fconnect = window.localStorage.getItem("fConnect");
    if(idUsuario > 0){$.mobile.changePage($("#pagemenuppal"))}
    var fullTiempo = 0; //Contador de tiempo general en segundos.
    var correctas = 0; //Contador de respuestas correctas.
    var Puntaje = 0;
    var refreshIntervalId;
    var elecciones = "";

    var db = new dbAdapter();
    db.iniciar().done(function () {
        $.mobile.loading( 'show', {
            text: 'Cargando',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        //alert("Iniciando");
        if(update == "2014-07-07 08:02:51"){
            $.ajax({
                type: "POST",
                url: "contenido.json",
                dataType: "json",
                data: "id=5",
                timeout: 600000,
                success: successCallback,
                error: errorCallback
            });
            function successCallback(ok){
                var datos = ok;
                //alert(datos);
                db.addFirstData(datos).done(function(){ 
                    //idUsuario=7;
                    update = "2014-07-07 08:02:52"
                    window.localStorage.setItem("lastUpdate",update);
                    $.mobile.loading('hide');
                    $.mobile.changePage($("#pageadmin"));
                });
            }
            function errorCallback(e){
                alert("error");
            }

        }else{
            //FUNCION UPDATE;
            $.mobile.loading('hide');
            if(idUsuario <= 0){
            $.mobile.changePage($("#pageadmin"));
            }
        }
    });
    $( "body>[data-role='panel']" ).panel(); //activo panel único
    $(".actualizar").hide();
    $("#glogin").hide();
    /*FUNCION UPDATE*//////////////////////////
    function actualizar(){
        $(".actualizar").hide();
        $.mobile.loading( 'show', {
            text: 'Actualizando',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        
                    //hago UPDATE
                    $.post("http://medchoice.com.ar/export/exportar",{},function(data){
                        if(data){
                            db.addFirstData(data).done(function(){
                                $.mobile.loading('hide'); 
                                window.localStorage.setItem("lastUpdate",update);
                                db.borrarEvPendientes().done(function(){
                                    $("#estadoUpdate").attr("class",'good');
                                    $("#estadoUpdate").html("La actualización se realizó correctamente");
                                })
                            });
                        }else{
                            $("#estadoUpdate").attr("class",'error');
                            $("#estadoUpdate").html("Hubo problemas para realizar la actualización. Verifique su conexión a internet y vuelva a intentarlo.");
                            $(".actualizar").show();
                        }
                    },"json")
                
    }
    /////////////*FIN UPDATE*/////////////////

    /*PAGINAS*////////////////////
    $("#pagemenuppal").on( "pageshow", function(event) { 
        $("#bienvenido").html("<i class='pe-7s-user pe-fw'></i><span>Bienvenido "+userName+"</span>");
         $.post("http://medchoice.com.ar/configuraciones/update",{},function(exito){
            if(exito){
                console.log("Fecha recibida");
                if(exito > update){
                    update = exito;
                    $(".actualizar").show('slow');
                    $("#popupUpdate").popup("open");
                    $(".actualizar").click(function(){
                        $("#popupUpdate").popup("close");
                        actualizar();
                    })
                    //actualizar();
                }else{

                }
            }
        })
    });

    $("#pageexamenes").on("pageshow",function(event){
       $.mobile.loading( 'show', {
            text: 'Cargando',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        
        db.traerExamenes(0).done(function(exito){
            //alert(exito);
             var a = 0;
            var li = "";
             var l = exito.length;

            $("#examenes").empty();
            for(a; a < l; a++ ){
                li ='<div data-role="collapsible" data-collapsed-icon="carat-d" data-expanded-icon="carat-u">';
                li += '<h4 class="titulodown">'+exito[a].nombre+'</h4>';
                li +='<ul data-role="listview" data-divider-theme="z" id="sub-'+exito[a].ID+'">';
                li += '</ul>';
                li += '</div>';
                $("#examenes").append(li);
            }

            //$("#popupDialog").popup("open");
            //alert(exito);
            $("#examenes").trigger("create");
            $.mobile.loading( 'hide');
        })
        db.traerExamenes(-1).done(function(hijos){
            var h = hijos.length
            var li = "";
            for(var b = 0; b < h; b++){
                li = '<li><a href="#popupDialog" rel="'+hijos[b].ID+'" data-rel="popup" data-position-to="window" data-transition="pop" class="ui-btn ui-btn-icon-right ui-icon-carat-r examen" title="Hacer el examen">';
                li += hijos[b].nombre;
                li += '</a></li>';
                $("#sub-"+hijos[b].parent).append(li);
                $("#sub-"+hijos[b].parent).trigger("create");
            }
            $(".examen").click(function(){
                idExamen = $(this).attr("rel");
                db.nombreExamen(idExamen).done(function(rs){
                    nameExamen = rs;
                                //Reviso si hay evaluaciones interrumpidas para dicho examen.
                    var datos = [];
                    datos.usuario=idUsuario;
                    datos.examen = idExamen;
                    db.verSiEstaInterrumpida(datos).done(function(exito){
                        if(exito.length > 0){
                            $("#iniciar span").html("Reiniciar");
                            $("#continuar").css("display","inline-block");
                            idEvaluacion = exito[0].ID;
                            $("#msg").html("Hay una evaluación inconclusa del examen "+nameExamen+". Seleccione la opción Continuar o Reiniciar.");      
                        }else{
                            $("#iniciar span").html("Iniciar");
                            $("#continuar").css("display","none");
                            $("#msg").html('Usted comenzará el examen "'+nameExamen+'". Al realizar click en Iniciar, comenzará a correr el tiempo y su score. De lo contrario, presionar "Cancelar"');      
                        }
                    });
                });
            });
        })
    })
    
    $("#pagescores").on( "pageshow", function(event) { 
        $.mobile.loading( 'show', {
                    text: 'Cargando',
                    textVisible: true,
                    theme: 'a',
                    html: ""
        });
        $("#evaluaciones").empty();
        db.traerEvaluaciones(idUsuario).done(function(exito){
            var total = exito.length;
            if(total>0){
               var skip = traerScores(exito,'local');
               //alert("SKIP="+skip);
               var jqxhr = $.post("http://medchoice.com.ar/evaluaciones/misscores",{user:idUsuario,omitir:skip},function(data){
                    if(!data.error){
                        traerScores(data,'lan');
                    }
                },"json")
               jqxhr.fail(function(){
                    alert("Error en la comunicación. Revise su conexión a internet e intente nuevamente. De lo contrario sus evaluaciones estarán desincronizadas");
                    $.mobile.loading('hide');
                })
            }else{
                var jqxhr = $.post("http://medchoice.com.ar/evaluaciones/misscores",{user:idUsuario,omitir:""},function(data){
                    if(!data.error){
                        traerScores(data,'lan');
                    }else{
                        //NO HAY SCORES
                        $.mobile.loading('hide');
                        $("#evaluaciones").html('<p>Aún no se registraron exámenes terminados</p>');
                    }
                },"json")
                jqxhr.fail(function(){
                    alert("Error en la comunicación. Revise su conexión a internet e intente nuevamente");
                    $.mobile.loading('hide');
                })
            }
        });
    })

    function traerScores(exito,origen){
        var total = 0;
                var omitir = " AND ";
                if(origen=="lan"){
                    total = exito.scores.length;
                    exito = exito.scores;
                }else{
                    total = exito.length;
                }
                var evalu = "";
                var exp=0;
                for(var w=0;w<total;w++){
                    if(exp!=exito[w].examen_id){
                        if(exp!=0){
                            if($("#drop"+exito[w].examen_id).length==0){
                                evalu += '</ul></div>';
                            }
                        }
                        if ($("#drop"+exito[w].examen_id).length==0){
                            //alert("No existe");
                        evalu += '<div data-role="collapsible" data-collapsed-icon="carat-d" data-expanded-icon="carat-u" id="drop'+exito[w].examen_id+'">';
                        exp = exito[w].examen_id;
                        evalu +='<h4 class="titulodown">'+exito[w].nombre+'</h4>';
                        evalu += '<ul data-role="listview" data-inset="false" class="registros">';
                        }
                    }
                    if ($("#drop"+exito[w].examen_id).length==0){
                    evalu += '<li id="s'+exito[w].ID+'"><a href="#">'+exito[w].fcreacion+' - '+exito[w].puntaje+' puntos.</a>'
                    +'<a href="#" rel="'+exito[w].fcreacion+'" data-num="'+exito[w].ID+'" class="ui-btn ui-icon-delete ui-btn-icon-notext borrar">Delete</a>'
                    +'<a href="#" rel="'+exito[w].fcreacion+'" data-num="'+exito[w].ID+'" class="ui-btn ui-icon-mail ui-btn-icon-notext exportar" style="margin-right:40px">Mail</a>'
                    +'</li>';
                    }else{
                        //alert("Existe");
                        var renglon = '<li id="s'+exito[w].ID+'"><a href="#">'+exito[w].fcreacion+' - '+exito[w].puntaje+' puntos.</a>'
                    +'<a href="#" rel="'+exito[w].fcreacion+'" data-num="'+exito[w].ID+'" class="ui-btn ui-icon-delete ui-btn-icon-notext borrar">Delete</a>'
                    +'<a href="#" rel="'+exito[w].fcreacion+'" data-num="'+exito[w].ID+'" class="ui-btn ui-icon-mail ui-btn-icon-notext exportar" style="margin-right:40px">Mail</a>'
                    +'</li>';
                    $("#drop"+exito[w].examen_id).find('ul').append(renglon);
                    }
                    if(w+1==total){
                        if ($("#drop"+exito[w].examen_id).length==0){
                            evalu += '</ul></div>';
                        }
                        if(origen=="local"){
                            omitir += "ev.fcreacion != '"+exito[w].fcreacion+"'";
                        }
                    }else{
                        if(origen=="local"){
                            omitir += "ev.fcreacion != '"+exito[w].fcreacion+"' AND ";
                        }
                    }
                    if(origen == "lan"){
                        var datos = [];
                        datos.id = exito[w].ID;
                        datos.usuario=exito[w].usuario_id;
                        datos.examen = exito[w].examen_id;
                        datos.estado = exito[w].estado;
                        datos.interrupcion = exito[w].interrupcion;
                        datos.tiempo = exito[w].tiempo;
                        datos.correctas = exito[w].correctas;
                        datos.eleccion = exito[w].respuestas;
                        datos.fecha = exito[w].fcreacion;
                        datos.puntaje= exito[w].puntaje;
                        datos.accion = "lan";
                            //alert("DATOS2="+datos.id+", "+datos.interrupcion+", "+datos.correctas+", "+datos.eleccion+", "+datos.fecha+", "+datos.puntaje+", "+datos.accion);
                        db.guardarEvaluacion(datos).done(function(){//alert("ok")});
                    }
                }
                //alert(evalu);
                $("#evaluaciones").append(evalu);
                $("#evaluaciones").trigger("create");
                $(".registros").listview( "refresh" );

                $(".borrar").click(function(e){
                    var f = $(this).attr('rel');
                    var id = $(this).data('num');
                    $("#accion").val('borrar');
                    $("#fechaApp").val(f);
                    $("#evalua").val(id);
                    $("#popupConfirm h1").html('Borrar evaluación');
                    $("#popupConfirm .texto").html('Desea borrar la evaluación seleccionada?');
                    $("#popupConfirm").popup('open');
                })
                $(".exportar").click(function(e){
                     e.preventDefault();
                    var id = $(this).data('num');
                    var f = $(this).attr('rel');
                    $("#accion").val('exportar');
                    $("#evalua").val(id);
                    $("#fechaApp").val(f);
                    $("#popupConfirm h1").html('Exportar a PDF');
                    $("#popupConfirm .texto").html('Se le enviará a su casilla de e-mail, registrada, un link de descarga de un documento PDF con el cuestionario completo con las respuestas correctas y seleccionadas por usted.');
                    $("#popupConfirm").popup('open');
                })

                $.mobile.loading('hide');
                if(origen == "local"){
                    //alert(omitir);
                    return omitir;
                }var total = 0;
                var omitir = " AND ";
                if(origen=="lan"){
                    total = exito.scores.length;
                    exito = exito.scores;
                }else{
                    total = exito.length;
                }
                var evalu = "";
                var exp=0;
                for(var w=0;w<total;w++){
                    if(exp!=exito[w].examen_id){
                        if(exp!=0){
                            if($("#drop"+exito[w].examen_id).length==0){
                                evalu += '</ul></div>';
                            }
                        }
                        if ($("#drop"+exito[w].examen_id).length==0){
                            //alert("No existe");
                        evalu += '<div data-role="collapsible" data-collapsed-icon="carat-d" data-expanded-icon="carat-u" id="drop'+exito[w].examen_id+'">';
                        exp = exito[w].examen_id;
                        evalu +='<h4 class="titulodown">'+exito[w].nombre+'</h4>';
                        evalu += '<ul data-role="listview" data-inset="false" class="registros">';
                        }
                    }
                    if ($("#drop"+exito[w].examen_id).length==0){
                    evalu += '<li id="s'+exito[w].ID+'"><a href="#">'+exito[w].fcreacion+' - '+exito[w].puntaje+' puntos.</a>'
                    +'<a href="#" rel="'+exito[w].fcreacion+'" data-num="'+exito[w].ID+'" class="ui-btn ui-icon-delete ui-btn-icon-notext borrar">Delete</a>'
                    +'<a href="#" rel="'+exito[w].fcreacion+'" data-num="'+exito[w].ID+'" class="ui-btn ui-icon-mail ui-btn-icon-notext exportar" style="margin-right:40px">Mail</a>'
                    +'</li>';
                    }else{
                        //alert("Existe");
                        var renglon = '<li id="s'+exito[w].ID+'"><a href="#">'+exito[w].fcreacion+' - '+exito[w].puntaje+' puntos.</a>'
                    +'<a href="#" rel="'+exito[w].fcreacion+'" data-num="'+exito[w].ID+'" class="ui-btn ui-icon-delete ui-btn-icon-notext borrar">Delete</a>'
                    +'<a href="#" rel="'+exito[w].fcreacion+'" data-num="'+exito[w].ID+'" class="ui-btn ui-icon-mail ui-btn-icon-notext exportar" style="margin-right:40px">Mail</a>'
                    +'</li>';
                    $("#drop"+exito[w].examen_id).find('ul').append(renglon);
                    }
                    if(w+1==total){
                        if ($("#drop"+exito[w].examen_id).length==0){
                            evalu += '</ul></div>';
                        }
                        if(origen=="local"){
                            omitir += "ev.fcreacion != '"+exito[w].fcreacion+"'";
                        }
                    }else{
                        if(origen=="local"){
                            omitir += "ev.fcreacion != '"+exito[w].fcreacion+"' AND ";
                        }
                    }
                    if(origen == "lan"){
                        var datos = [];
                        datos.id = exito[w].ID;
                        datos.usuario=exito[w].usuario_id;
                        datos.examen = exito[w].examen_id;
                        datos.estado = exito[w].estado;
                        datos.interrupcion = exito[w].interrupcion;
                        datos.tiempo = exito[w].tiempo;
                        datos.correctas = exito[w].correctas;
                        datos.eleccion = exito[w].respuestas;
                        datos.fecha = exito[w].fcreacion;
                        datos.puntaje= exito[w].puntaje;
                        datos.accion = "lan";
                            //alert("DATOS2="+datos.id+", "+datos.interrupcion+", "+datos.correctas+", "+datos.eleccion+", "+datos.fecha+", "+datos.puntaje+", "+datos.accion);
                        //db.guardarEvaluacion(datos).done(function(){alert("ok")});
                    }
                }
                //alert(evalu);
                $("#evaluaciones").append(evalu);
                $("#evaluaciones").trigger("create");
                $(".registros").listview( "refresh" );

                $(".borrar").click(function(e){
                    var f = $(this).attr('rel');
                    var id = $(this).data('num');
                    $("#accion").val('borrar');
                    $("#fechaApp").val(f);
                    $("#evalua").val(id);
                    $("#popupConfirm h1").html('Borrar evaluación');
                    $("#popupConfirm .texto").html('Desea borrar la evaluación seleccionada?');
                    $("#popupConfirm").popup('open');
                })
                $(".exportar").click(function(e){
                     e.preventDefault();
                    var id = $(this).data('num');
                    var f = $(this).attr('rel');
                    $("#accion").val('exportar');
                    $("#evalua").val(id);
                    $("#fechaApp").val(f);
                    $("#popupConfirm h1").html('Exportar a PDF');
                    $("#popupConfirm .texto").html('Se le enviará a su casilla de e-mail, registrada, un link de descarga de un documento PDF con el cuestionario completo con las respuestas correctas y seleccionadas por usted.');
                    $("#popupConfirm").popup('open');
                })

                $.mobile.loading('hide');
                if(origen == "local"){
                    //alert(omitir);
                    return omitir;
                }
    }

    $("#pageprerank").on("pageshow",function(event){
       $.mobile.loading( 'show', {
            text: 'Cargando',
            textVisible: true,
            theme: 'a',
            html: ""
        });
       db.traerExamenes(0).done(function(exito){
            //alert(exito);
             var a = 0;
            var li = "";
             var l = exito.length;

            $("#rank").empty();
            for(a; a < l; a++ ){
                li ='<div data-role="collapsible" data-collapsed-icon="carat-d" data-expanded-icon="carat-u">';
                li += '<h4 class="titulodown">'+exito[a].nombre+'</h4>';
                li +='<ul data-role="listview" data-divider-theme="z" id="sub2-'+exito[a].ID+'">';
                li += '</ul>';
                li += '</div>';
                $("#rank").append(li);
            }

            //$("#popupDialog").popup("open");
            //alert(exito);
            $("#rank").trigger("create");
            $.mobile.loading( 'hide');
        })
        db.traerExamenes(-1).done(function(hijos){
            var h = hijos.length
            var li = "";
            for(var b = 0; b < h; b++){
                li = '<li><a href="#popupDialog" rel="'+hijos[b].ID+'" data-rel="popup" data-position-to="window" data-transition="pop" class="ui-btn ui-btn-icon-right ui-icon-carat-r examen" title="Hacer el examen">';
                li += hijos[b].nombre;
                li += '</a><li>';
                $("#sub2-"+hijos[b].parent).append(li);
                $("#sub2-"+hijos[b].parent).trigger("create");
            }
            $(".examen").click(function(){
                idExamen = $(this).attr("rel");
                $.post("http://medchoice.com.ar/evaluaciones/ranking",{examen:idExamen},function(exito){
                    if(exito && !exito.error){
                        $("#hay").hide();
                        $("#tabrank").show();
                        console.log("OK! "+JSON.stringify(exito));
                        var tot = exito.length;
                        console.log("tot"+tot);
                        var filas = "";
                        var seudonimo = "";
                        var inicial = "";
                        var pos = 0;
                        var mipos="";
                        for(var f=0; f<tot;f++){
                            seudonimo = exito[f].nombre;
                            inicial = " "+exito[f].apellido.charAt(0)+".";
                            seudonimo += inicial.toUpperCase();
                            pos++
                            var Tiempo = 0;
                            Tiempo = pasarATiempo(exito[f].tiempo);
                            if(exito[f].usuario_id==idUsuario){
                                mipos = "class='yo'";
                            }else{
                                mipos = "";
                            }
                            if(f<10 || exito[f].usuario_id==idUsuario){
                                filas +="<tr "+mipos+"><th>"+pos+"</th><td>"+seudonimo+"</td><td>"+exito[f].puntaje+"</td><td>"+Tiempo+"</td></tr>";
                            }
                            //filas +="<tr><th>"+pos+"</th><td>"+seudonimo+"</td><td>"+exito[f].puntaje+"</td><td>"+Tiempo+"</td></tr>";
                        }
                        $("#resRanking").html(filas);
                        $.mobile.changePage($("#pageranking"));
                    }else{
                        $("#hay").show();
                        $("#tabrank").hide();
                        $("#resRanking").html("");
                        $.mobile.changePage($("#pageranking"));
                    }
                },"json")
            });
        })
            $("#rank").trigger("create");
            $.mobile.loading( 'hide');
    })

    // $("#pageranking").on( "pageshow", function(event) { 
    //     $.mobile.loading( 'show', {
    //         text: 'Cargando',
    //         textVisible: true,
    //         theme: 'a',
    //         html: ""
    //     });

    // });
    
    $("#pageexamen").on( "pagehide", function( event ) { 
        pausa = true;
        idExamen = 0;
        numPreg = 0;
        eleccion = 0; // Selección de la respuesta del usuario.
        nameExamen = "";
        totalPreg = 0; //HACER VARIABLE
        idEvaluacion = 0;
        fullTiempo = 0; //Contador de tiempo general en segundos.
        correctas = 0; //Contador de respuestas correctas.
        Puntaje = 0;
        clearInterval(refreshIntervalId);
        $("#pregunta").html("");
        $("#respuestas").html("");
    } )


    /* SHARE BUTTON */////////////////////////////////////////////
    $(".share").click(function(){
        var txt="Mi puntaje en MedChoice fue de "+Puntaje;
        window.plugins.socialsharing.share(txt);
    })
    ////////////////////////* FIN SHARE BUTTON */////////////////////////
    $("#fconnect").click(function(){
        FB.login(
            function(response) {
                //alert(JSON.stringify(response));
                if (response.authResponse.session_key) {
                    //alert('logged in');
                    window.localStorage.setItem("fConnect",true);
                    fconnect = true;
                    //alert(JSON.stringify(response));
                    //alert(response.authResponse.userId);
                     db.usuarioFb(response.authResponse.userId).done(function(exito){
                        if(exito){
                            var seudonimo = "";
                            seudonimo = exito.nombre;
                            var inicial = "";
                            inicial = " "+exito.apellido.charAt(0)+".";
                            seudonimo += inicial.toUpperCase();
                            window.localStorage.setItem("userID",exito.ID);
                            window.localStorage.setItem("userName",seudonimo);
                            userID = exito.ID;
                            userName = seudonimo;
                            $.mobile.loading( 'hide');
                            $.mobile.changePage($("#pagemenuppal"));
                        }else{
                            $.post('http://medchoice.com.ar/login/fbuser',{uid:response.authResponse.userId},function(exito){
                                if(exito){
                                    if(!exito.error){
                                        var datos = [];
                                        datos.ID = exito.id;
                                        window.localStorage.setItem("userID",exito.id);
                                        userID = exito.id;
                                        datos.nombre = exito.nombre;
                                        datos.apellido = exito.apellido;
                                        var seudonimo = "";
                                        seudonimo = exito.nombre;
                                        var inicial = "";
                                        inicial = " "+exito.apellido.charAt(0)+".";
                                        seudonimo += inicial.toUpperCase();
                                        datos.seudonimo = seudonimo;
                                        window.localStorage.setItem("userName",seudonimo);
                                        userName = seudonimo;
                                        datos.email = exito.email;
                                        datos.pass = exito.pass;
                                        datos.estado = exito.estado;
                                        datos.terminos = exito.terminos;
                                        datos.fcreacion = exito.fcreacion;
                                        db.guardarUsuario(datos).done(function(exito){
                                            $.mobile.loading( 'hide');
                                            $.mobile.changePage($("#pagemenuppal"))
                                            console.log("ESA!");
                                        });
                                    }else{
                                        //alert("me");
                                        me();
                                    }
                                }
                            },"json");
                            //me();
                        } 
                     })
                    
                } else {
                    alert('Login incompleto.');
                }
            },
            { scope: "email" }
        );
    })
        var friendIDs = [];
            var fdata;
            function me() {
                FB.api('/me', { fields:'name, email, first_name, last_name, gender' },  function(response) {
                       if (response.error) {
                      // alert(JSON.stringify(response.error));
                       } else {
                       var datos = [];
                       datos.seudonimo = response.name;
                       datos.nombre = response.first_name;
                       datos.apellido = response.last_name;
                       datos.email = response.email;
                       datos.uid = response.id;
                       datos.token = "";
                       datos.sexo = response.gender;
                       datos.pass = "Rj45F";//OCULTAR.
                       datos.identidad = 1;
                       datos.terminos = 2;
                       //alert(response.name+" "+response.first_name+" "+response.last_name+" "+response.email+" "+response.id+" "+response.gender);
                       registro(datos);
                       }
                       });
            }
            
    $("#acepto").click(function(){
        var Id = $("#evalua").val();
        var fApp = $("#fechaApp").val();
        //fApp = darVueltaFecha(fApp);
        switch($("#accion").val()){
            case "borrar":
            $.mobile.loading( 'show', {
            text: 'Eliminando',
            textVisible: true,
            theme: 'a',
            html: ""
            }); 
            db.borrarEvSelect(Id).done(function(exito){
                if(exito=="ok"){
                    $("#s"+Id).remove();
                    var jqxhr = $.post('http://medchoice.com.ar/evaluaciones/borrar',{fecha:fApp,user:idUsuario},function(exito){
                            $.mobile.loading('hide');
                    })
                    jqxhr.fail(function(){
                        $.mobile.loading('hide');
                    })
                    $.mobile.loading('hide');
                    $("#popupConfirm").popup("close");
                }else{
                    alert("Error al borrar. Inténtelo nuevamente");
                    $.mobile.loading('hide');
                    $("#popupConfirm").popup("close");
                }
            });
            break;
            case "exportar":
                $.mobile.loading( 'show', {
                text: 'Enviando',
                textVisible: true,
                theme: 'a',
                html: ""
                });
                console.log(fApp+" - "+idUsuario);
                var jqxhr = $.post('http://medchoice.com.ar/pdf/pdf1',{fecha:fApp,user:idUsuario},function(exito){
                    if(exito=="OK"){
                        $.mobile.loading('hide');
                        $("#popupConfirm").popup('close');
                    }else if(exito=="vacio"){
                        db.traerEvaluacion(Id).done(function(datos){
                            var row = datos[0];
                            $.post("http://medchoice.com.ar/evaluaciones/nuevo",{usuario:row.usuario_id,examen:row.examen_id,tiempo:row.tiempo,puntaje:row.puntaje,respuestas:row.respuestas,fcreacion:row.fcreacion},function(res){
                                if(res=="ok"){
                                    var jqxhr2 = $.post('http://medchoice.com.ar/pdf/pdf1',{fecha:fApp,user:idUsuario},function(exito){
                                    if(exito=="OK"){
                                        $.mobile.loading('hide');
                                        $("#popupConfirm").popup('close');
                                    }else if(exito=="vacio"){
                                        alert("Lamentablemente este examen no se ha podido exportar.");
                                        $.mobile.loading('hide');
                                         $("#popupConfirm").popup('close');
                                    }});
                                    jqxhr2.fail(function(){
                                         alert( "Error de conexión. Revise su conexión." );
                                         $.mobile.loading('hide');
                                         $("#popupConfirm").popup('close');
                                    })
                                }else{
                                    alert( "Error de conexión. Revise su conexión." );
                                    $.mobile.loading('hide');
                                    $("#popupConfirm").popup('close');
                                }
                            })
                        })
                    }
                })
                jqxhr.fail(function() {
                    alert( "Error de conexión. Revise su conexión." );
                    $.mobile.loading('hide');
                })
            break;
            case "compartir":
            break;
        }
    })


    $("#consultar").click(function(){
        var Asunto = $("#asunto").val();
        var Mensaje = $("#consulta").val();
        var fecha = js_yyyy_mm_dd_hh_mm_ss();
        console.log("us:"+idUsuario+", asunto:"+Asunto+", mensaje:"+Mensaje+", fcreacion:"+fecha);
        $.mobile.loading( 'show', {
            text: 'Enviando',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        $.post("http://medchoice.com.ar/consultas/nueva",{enviar:1,usuario:idUsuario,asunto:Asunto,mensaje:Mensaje,fcreacion:fecha},function(exito){
            if(exito){
                console.log(exito);
                switch(exito){
                    case "ER100":
                    case "ER101":
                    case "ER102":
                    case "ER103":
                        $("#erConsulta").html("Error");
                    break;
                    case "ok":
                        $("#asunto").val("");
                        $("#consulta").val("");
                        $("#erConsulta").empty();
                        $.mobile.loading('hide');
                        $("#enviado").html("Se envió correctamente");
                    break;
                }
            }else{
                $.mobile.loading('hide');
                 $("#erConsulta").html("Error");
            }
        })
    })

    $("#notificar").click(function(){
        var mensaje = $("#reporte").val();
        var pregId = $("#pregid").val();
        console.log("mensaje"+mensaje+" - pregID"+pregId);
        $.mobile.loading( 'show', {
            text: 'Enviando',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        $.post("http://medchoice.com.ar/errores/nuevo",{enviar:1,pregunta:pregId,error:mensaje,usuario:idUsuario},function(exito){
            if(exito == "ok"){
                //enviado
                $.mobile.loading('hide');
                $("#ernoti").attr('class','good');
                $("#ernoti").html('Se envió correctamente');
                $("#ernoti").animate({opacity:'.9'},2000,function(){
                $("#ernoti").empty();
                $("#reporte").val("");
                $("#popupReporte").popup("close");
                })
            }else{
                //error
                $.mobile.loading('hide');
                $("#ernoti").attr('class','error');
                $("#ernoti").html('No se pudo enviar, compruebe su conexión a internet.');
            }
        });
    });


    


    $("#reiniciar").click(function(){
        var datos = [];
        datos.usuario=idUsuario;
        datos.examen = idExamen;
        db.borrarEvaluacionesDe(datos).done(function(exito){
            if(exito=="ok"){
                $("#iniciar").click();
            }
        });
    })
    $("#continuar").click(function(){
        db.traerEvaluacion(idEvaluacion).done(function(exito){
            var row = exito[0];
            console.log("DATOS = "+row.tiempo+", "+row.interrupcion+", "+row.correctas);
            if(row.fullTiempo != null){ fullTiempo = row.tiempo };
            if(row.interrupcion != null) { numPreg = row.interrupcion};
            if(row.correctas != null) { correctas = row.correctas};
            if(row.respuestas != null) { elecciones = row.respuestas};
            $("#iniciar").click();
        })
    })
    $("#iniciar").click(function(){
        $.mobile.changePage($("#pageexamen"));
        $("#tiempo").show('fast');
        $('#examen').html('<i class="pe-7s-note2"></i><span>'+nameExamen+'</span>');
        db.cantidadPreguntas(idExamen).done(function(exito){
            totalPreg = exito;
            console.log("TOTAL PREGUNTAS= " + totalPreg);
            console.log(idExamen+" MAS "+numPreg);
            db.traerPregunta(idExamen,numPreg).done(function(exito){
                $("#respuestas").append('<legend>'+exito[0].pregunta+'</legend>');
                $("#pregid").val(exito[0].ID);
                console.log("TAMBIEN="+exito[0].ID);
                db.traerRespuestas(exito[0].ID).done(function(exito){
                    var cant = exito.length;
                    var html = "";
                    console.log("esta="+exito.length);
                    for(var r=0;r<cant;r++){
                        html +='<input type="radio" name="respuesta" id="respuesta-'+r+'" value="'+exito[r].correcta+'">';
                        html +='<label for="respuesta-'+r+'">'+exito[r].respuesta+'</label>';
                        console.log(exito[r].respuesta);
                    }
                    $("#respuestas").append(html);
                    $("#respuestas").trigger("create");
                    $('#radioRespuestas input').on('change', function() {
                        eleccion = $('input[name=respuesta]:checked', '#radioRespuestas').attr('id');
                        console.log(eleccion); 

                    });
                    if(idEvaluacion==0){
                        var datos = [];
                        datos.usuario = idUsuario;
                        datos.examen = idExamen;
                        datos.fecha = js_yyyy_mm_dd_hh_mm_ss();
                        db.guardarEvaluacion(datos).done(function(exito){
                            idEvaluacion = exito;
                        });
                    }
                    $("#tiempo #minuto").html("01");
                    $("#tiempo #segundo").html("30");
                    pausa = false;
                    refreshIntervalId = setInterval(timerExamen,1000);
                    muestraPage=numPreg+1;
                    $(".paginado").html("Pregunta N°"+muestraPage+" de "+totalPreg);
                })
            });
        });
        //$('#tiempo').countdown({until: '+1h +1m +15s', format: 'YOWDHMS', significant: 2}); 
    });
    $(".nextBtn").click(function(){
        var cual;
        var nom = "";
       // $("#paginado").html(numpreg+" de "+totalPreg);
        $("input[name=respuesta]").each(function(){
            if($(this).val()==1){
                cual = $(this);
            }
        });
        nom = $(cual).attr('id');
        if(nom==eleccion){
            console.log("CORRECTO!");
            correctas++;
        }else{
            if(eleccion != ""){
                $("label[for='"+eleccion+"']").css("background-color","red");
                $("label[for='"+eleccion+"']").css("color","#fff");
                $("label[for='"+eleccion+"']").css("text-shadow","none");
            }
        }
        $("label[for='"+nom+"']").css("background-color","green");
        $("label[for='"+nom+"']").css("color","#fff");
        $("label[for='"+nom+"']").css("text-shadow","none");
        $(cual).animate({opacity:'.9'},1000,function(){
        numPreg=numPreg + 1;
        muestraPage=numPreg+1;
        $(".paginado").html("Pregunta N°"+muestraPage+" de "+totalPreg);
        var datos = [];
        datos.id = idEvaluacion;
        datos.interrupcion = numPreg;
        datos.tiempo = fullTiempo;
        datos.correctas = correctas;
        datos.eleccion = elecciones + eleccion;
        datos.fecha = js_yyyy_mm_dd_hh_mm_ss();
        elecciones = elecciones + eleccion +",";
        eleccion = "";
        if(numPreg == totalPreg){
            Puntaje = correctas;
            datos.puntaje= Puntaje;
            datos.accion = "finalizar";
        }
        console.log("CORRECTAS="+correctas+", Tiempo="+fullTiempo);
            db.guardarEvaluacion(datos).done(function(exito){
                $("#respuestas").empty();
                $.mobile.loading( 'show', {
                            text: 'Cargando',
                            textVisible: true,
                            theme: 'a',
                            html: ""
                });
                if(numPreg < totalPreg){
                    db.traerPregunta(idExamen,numPreg).done(function(exito){
                        $.mobile.loading('hide');
                        $("#tiempo #minuto").html("01");
                        $("#tiempo #segundo").html("30");
                        pausa = false;
                        $("#respuestas").append('<legend>'+exito[0].pregunta+'</legend>');
                        $("#pregid").val(exito[0].ID);
                        db.traerRespuestas(exito[0].ID).done(function(exito){
                            var cant = exito.length;
                            var html = "";
                            for(var r=0;r<cant;r++){
                                html +='<input type="radio" name="respuesta" id="respuesta-'+r+'" value="'+exito[r].correcta+'">';
                                html +='<label for="respuesta-'+r+'">'+exito[r].respuesta+'</label>';
                            }
                            $("#respuestas").append(html);
                            $("#respuestas").trigger("create");
                            $('#radioRespuestas input').on('change', function() {
                                eleccion = $('input[name=respuesta]:checked', '#radioRespuestas').attr('id');
                                console.log(eleccion); 

                            });
                        })
                    });
                }else{
                    $.mobile.loading('hide');
                    pausa = true;
                    $("#tiempo").hide('fast');
                    //console.log("Correctas ="+correctas);
                    //console.log("puntos ="+puntaje);
                    $("#puntos").html(Puntaje+" puntos");
                    var Tiempo = 0;
                    Tiempo = pasarATiempo(fullTiempo);
                    var fecha = js_yyyy_mm_dd_hh_mm_ss();
                    $("#masinfo").html("Respondiste "+correctas+" preguntas correctamente en "+Tiempo)
                    $("#popupPuntaje").popup("open");
                    Tiempo = parseInt(Tiempo);
                    $.post("http://medchoice.com.ar/evaluaciones/nuevo",{usuario:idUsuario,examen:idExamen,tiempo:fullTiempo,puntaje:Puntaje,respuestas:elecciones,fcreacion:fecha},function(res){
                        console.log("AQUI"+res);
                        if(res=="ok"){
                            console.log("guardo en la nube");
                        }
                    })
                }
            });
        });
    });
    var timerExamen = function() {
        if(pausa == false){
            var minuto = $("#tiempo #minuto").html();
            var segundo = $("#tiempo #segundo").html();
            if(minuto=="01" && segundo>0){
                segundo = segundo - 1;
                if(segundo < 10 ){
                    $("#tiempo #segundo").html("0"+segundo);
                }else{
                    $("#tiempo #segundo").html(segundo);
                }
                
            }else if(minuto=="01" && segundo=="00"){
                $("#tiempo #minuto").html("00");
                $("#tiempo #segundo").html("59");
            }else if(minuto=="00" && segundo == "00"){
                $(".nextBtn").click();
                pausa = true;
            }else{
                segundo = segundo - 1;
                 if(segundo < 10 ){
                    $("#tiempo #segundo").html("0"+segundo);
                }else{
                    $("#tiempo #segundo").html(segundo);
                }
            }
            fullTiempo++; //Contador de tiempo general en segundos.
        }
    };

    

    /* REGISTRO DE USUARIO *//////////////////////////////////////
    $("#registrar").click(function(){
        $("#erterminos").empty();
        $("#ernombre").empty();
        $("#erapellido").empty();
        $("#eremail").empty();
        $("#erpass").empty();
        var Nombre = $("#nombre").val();
        var Apellido = $("#apellido").val();
        var Email = $("#emailreg").val();
        var Pass = $("#passreg").val();
        var sexo = "";
        var Identidad = $("#identidad").val();
        var Terminos = 0;
        var seudonimo = "";
        seudonimo = Nombre;
        inicial = " "+Apellido.charAt(0)+".";
        seudonimo += inicial.toUpperCase();
        var inicial = "";
        var er = 0;
        if($("#terminos-1a").prop("checked")==true && $("#terminos-1b").prop("checked")==true){
            Terminos = 2;
        }else if($("#terminos-1a").prop("checked")!=true){
            Terminos = 1;
        }else{
            er++;
            $("#erterminos").html("Para registrarse debe aceptar los términos y condiciones");
        }
        if(Nombre == ""){
            er++;
            $("#ernombre").html("Campo obligatorio");
        }
        if(Apellido == ""){
            er++;
            $("#erapellido").html("Campo obligatorio");
        }
        if(Email == ""){
            er++;
            $("#eremail").html("Campo obligatorio");
        }else{
            if(!validar_email(Email)){
                er++;
                $("#eremail").html("El e-mail ingresado no contiene un formato válido.");
            }
        }
        $( "select[name='sexo'] option:selected" ).each(function() {
            sexo=$(this).val();
        });
        if(Pass == ""){
            er++;
            $("#erpass").html("Campo obligatorio");
        }
        if(er<1){
            $.mobile.loading( 'show', {
                            text: 'Registrando',
                            textVisible: true,
                            theme: 'a',
                            html: ""
            });
            var datos = [];
            datos.seudonimo = seudonimo;
            datos.nombre = Nombre;
            datos.apellido = Apellido;
            datos.email = Email;
            datos.uid = "";
            datos.token = "";
            datos.sexo = sexo;
            datos.pass = Pass;
            datos.identidad = Identidad;
            datos.terminos = Terminos;
            
            registro(datos);
        }
    })
   ///////////*FIN DE REGISTRO*///////////////////////////////////

   /*Login*///////////////////////////////////
   $("#login").click(function(){
     $.mobile.loading( 'show', {
                            text: 'Autenticando',
                            textVisible: true,
                            theme: 'a',
                            html: ""
                });
        var Email = $("#email").val();
        var Pass = $("#pass").val();
        if(email!="" && pass !=""){
        if(!validar_email(Email)){
            $("#erlogin").html("El formato del e-mail no es válido");
            $.mobile.loading('hide');
        }else{
            /*CHECKEO DE USUARIO OFFLINE*////////////////////////////
            var datos = [];
            var seudonimo = "";
            var inicial = "";
            datos.email = Email;
            datos.pass = convertirSha1(Pass);

            db.validarUsuario(datos).done(function(exito){
                if(exito.ID){

                    idUsuario = exito.ID;
                    seudonimo = exito.nombre;
                    inicial = " "+exito.apellido.charAt(0)+".";
                    seudonimo += inicial.toUpperCase();
                    userName = seudonimo;
                    window.localStorage.setItem("userID",idUsuario);
                    window.localStorage.setItem("userName",seudonimo);
                    $.mobile.loading( 'hide');
                    $.mobile.changePage($("#pagemenuppal"));
                }else{
                    /*CHECKEO ONLINE*//////////////////////////////

                   var logon = $.post("http://medchoice.com.ar/login",{enviar:1,email:Email,pass:Pass},function(exito){
                        if(exito){
                            console.log(exito);
                            if(exito.error){
                                switch(exito.error){
                                    case "ER101":
                                        $("#erlogin").html("Ingrese el E-mail");
                                        $.mobile.loading('hide');
                                    break;
                                    case "ER102":
                                        $("#erlogin").html("Ingrese la contraseña");
                                        $.mobile.loading('hide');
                                    break;
                                    case "ER103":
                                        $("#erlogin").html("Error. Compruebe que el e-mail y la contraseña sean los correctos.");
                                        $.mobile.loading( 'hide');
                                    break;
                                    case "ER104":
                                        $("#erlogin").html("El e-mail no se encuentra registrado");
                                        $.mobile.loading('hide');
                                    break;
                                }
                            }else{
                                console.log("#ID "+exito.nombre);
                                idUsuario = exito.id;
                                seudonimo = exito.nombre;
                                inicial = " "+exito.apellido.charAt(0)+".";
                                seudonimo += inicial.toUpperCase();
                                userName = seudonimo;
                                window.localStorage.setItem("userID",idUsuario);
                                window.localStorage.setItem("userName",seudonimo);
                                var datos = [];
                                datos.ID = idUsuario;
                                datos.nombre = exito.nombre;
                                datos.apellido = exito.apellido;
                                datos.seudonimo = seudonimo;
                                datos.email = exito.email;
                                datos.pass = exito.pass;
                                datos.estado = exito.estado;
                                datos.terminos = exito.terminos;
                                datos.fcreacion = exito.fcreacion;
                                db.guardarUsuario(datos).done(function(exito){
                                    $.mobile.loading( 'hide');
                                    $.mobile.changePage($("#pagemenuppal"))
                                    console.log("ESA!");
                                });
                            }
                        }
                    },"json");
                logon.fail(function(){
                    alert("Error. Verifique su conexión a internet.");
                })
                }
            })
        }
    }else{
        $("#erlogin").html("Complete los datos de login");
    }
   });
   //////////*FIN LOGIN*/////////////////////

   /*LOGOUT*////////////////////////////////
   $('.closeSession').click(function(){
        idUsuario = 0;
        window.localStorage.removeItem("userID");
        window.localStorage.removeItem("userName");
        if(window.localStorage.getItem('fConnect')==true){
                FB.logout(function(response) {

                });
                window.localStorage.setItem('fConnect',false);
        }
        $("#email").html("");
        $("#pass").html("");
        $("#erlogin").html("");
        $.mobile.changePage($("#pageadmin"));
   })
   /////////*FIN LOGOUT*///////////////////
   function registro(datos){
    $.mobile.loading( 'show', {
                text: 'Enviando',
                textVisible: true,
                theme: 'a',
                html: ""
                });
    //alert("username:"+datos.seudonimo+",nombre:"+datos.nombre+",apellido:"+datos.apellido+",emailreg:"+datos.email+",uid:"+datos.uid+",token:"+datos.token+",sexo:"+datos.sexo+",passReg:"+datos.pass+",identidad:"+datos.identidad+",terminos:"+datos.terminos);
        $.post("http://medchoice.com.ar/registro/nuevo",{guardar:1,username:datos.seudonimo,nombre:datos.nombre,apellido:datos.apellido,emailreg:datos.email,uid:datos.uid,token:datos.token,sexo:datos.sexo,passReg:datos.pass,identidad:datos.identidad,terminos:datos.terminos},function(exito){
                if(exito){
                    if(exito!=""){ 
                        switch(exito){
                            case "ER101":
                                 $("#ernombre").html("Campo obligatorio");
                                 $.mobile.loading('hide');
                                alert("Complete los campos obligatorios");
                            break;
                            case "ER102":
                                 $("#erapellido").html("Campo obligatorio");
                                 $.mobile.loading('hide');
                                 alert("Complete los campos obligatorios");
                            break;
                            case "ER103":
                                 $("#eremail").html("El e-mail ya se encuentra registrado");
                                 $.mobile.loading('hide');
                                 alert("El e-mail ya se encuentra registrado");
                            break;
                            default:
                            //console.log("USUARIO REGISTRADO CON EL ID "+exito);
                           // var valores = [];
                           /* valores.ID = exito;
                            valores.username= datos.seudonimo;
                            valores.nombre = datos.nombre;
                            valores.apellido = datos.apellido;
                            valores.email = datos.email;
                            valores.pass = convertirSha1(datos.pass);
                            valores.estado = datos.identidad;
                            valores.terminos = datos.terminos;
                            valores.fcreacion = new Date();*/
                            datos.pass = convertirSha1(datos.pass);
                            datos.fcreacion = new Date();
                            datos.ID = exito;
                            //GUARDAR REGISTRO DE USUARIO EN BASE INTERNA Y DEJAR LOGEADO.
                            db.guardarUsuario(datos).done(function(exito){
                                idUsuario = exito;
                                userName = datos.seudonimo;
                                window.localStorage.setItem("userID",idUsuario);
                                window.localStorage.setItem("userName",datos.seudonimo);
                                $("#nombre").val("");
                                $("#apellido").val("");
                                $("#emailreg").val("");
                                $("#passreg").val("");
                                $("#terminos-1a").prop("checked",true);
                                $("#terminos-1b").prop("checked",true);
                                $.mobile.loading('hide');
                                $.mobile.changePage($("#pagemenuppal"));
                            })
                        }
                    }
                    $.mobile.loading('hide');
                }
            })
    }

    document.addEventListener("backbutton", onBackKeyDown, false);

    function onBackKeyDown() {
        // Maneja el evento del botón atrás
       var p = jQuery.mobile.path.parseLocation();
        if(p.hash!="#pageadmin" && p.hash!="#pagemenuppal"){
            navigator.app.backHistory();
        }
    }
    $(".recuperar").click(function(){
        var mail = $("#email").val();
        if(validar_email(mail)){
            $.post('http://medchoice.com.ar/registro/recuperarPass',{email:mail},function(exito){
                if(exito=="no"){
                    $("#erlogin").html("El e-mail no posee un formato adecuado.");
                }else{
                    $("#erlogin").empty();
                    $("#glogin").html('Le hemos enviado un enlace de recupero a su email');
                    //window.localStorage.setItem("recupero")
                    $("#glogin").show();
                }
            });
        }else{
            $('#erlogin').html("Debe ingresar el e-mail que corresponda a su cuenta");
        }
    })

}




function validar_email(valor){
    // creamos nuestra regla con expresiones regulares.
        var filter = /[\w-\.]{3,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/;
        // utilizamos test para comprobar si el parametro valor cumple la regla
        if(filter.test(valor))
            return true;
        else
            return false;
}

function convertirSha1(clave){
    var shaObj = new jsSHA(clave, "TEXT");
    var hmac = shaObj.getHMAC("51277c88f01df", "TEXT", "SHA-1", "HEX");
    return hmac;
}

function darVueltaFecha(valor){
    var uno = valor.split(" ");
    var dos = uno[0].split("/");
    var tres;
    tres = dos[2] + "-";
    if(dos[1].length==1){
        tres += "0"+String(dos[1])+"-";
    }else{
        tres += dos[1]+"-";
    }
    if(dos[0].length==1){
        tres += "0"+String(dos[0])+" ";
    }else{
        tres += dos[0]+" ";
    }
    tres = tres + uno[1];
    return tres;
}

function js_yyyy_mm_dd_hh_mm_ss() {
  now = new Date();
  year = "" + now.getFullYear();
  month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
  day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
  hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
  minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
  second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
  return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

function pasarATiempo(valor){
    var hours = Math.floor( valor / 3600 );  
    var minutes = Math.floor( (valor % 3600) / 60 );
    var seconds = valor % 60;
 
    //Anteponiendo un 0 a los minutos si son menos de 10 
    minutes = minutes < 10 ? '0' + minutes : minutes;
 
    //Anteponiendo un 0 a los segundos si son menos de 10 
    seconds = seconds < 10 ? '0' + seconds : seconds;
 
    return hours + ":" + minutes + ":" + seconds;  // 2:41:30
}