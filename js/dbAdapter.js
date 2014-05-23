//dbAdapter
//creación de base
function dbAdapter(){
	
	this.iniciar = function(){
		var deferred = $.Deferred();
		this.db = window.openDatabase("medchoice","1.0","MedChoice",8388608);
		this.db.transaction(
            function (tx) {
               createTable(tx);
                //addSampleData(tx);
            },
            function (error) {
                //alert('Transaction error: ' + error);
                deferred.reject('Transaction error: ' + error);
            },
            function () {
                //alert('Transaction success');
                deferred.resolve();
            }
        );
        return deferred.promise();
    }
 
	var  createTable = function(tx) {
	 	tx.executeSql("CREATE TABLE IF NOT EXISTS "+
	        "examenes(ID INTEGER PRIMARY KEY ASC,"+
	        "nombre VARCHAR(50),"+
	        "fcreacion DATETIME"+
	        ")", []);
	    tx.executeSql("CREATE TABLE IF NOT EXISTS "+
	        "preguntas(ID INTEGER PRIMARY KEY ASC,"+
	        "pregunta TEXT,"+
	        "examen_id INTEGER,"+
	        "fcreacion DATETIME)",[]);
	    tx.executeSql("CREATE TABLE IF NOT EXISTS "+
	        "respuestas(ID INTEGER PRIMARY KEY ASC,"+
	        "respuesta TEXT,"+
	        "pregunta_id INTEGER,"+
	        "correcta INTEGER)",[]);
	    tx.executeSql("CREATE TABLE IF NOT EXISTS "+
	        "usuarios(ID INTEGER PRIMARY KEY ASC,"+
	        "nombre TEXT,"+
	        "apellido TEXT,"+
	        "email TEXT,"+
	        "pass TEXT,"+
	        "nivel INTEGER,"+
	        "estado INTEGER,"+
	        "terminos INTEGER,"+
	        "recupero TEXT,"+
	        "fcreacion DATETIME)", []);
	    tx.executeSql("CREATE TABLE IF NOT EXISTS "+
	        "evaluaciones(ID INTEGER PRIMARY KEY ASC,"+
	        "usuario_id INTEGER,"+
	        "examen_id INTEGER,"+
	        "estado INTEGER,"+
	        "interrupcion INTEGER,"+
	        "tiempo TEXT,"+
	        "correctas INTEGER,"+
	        "puntaje REAL,"+
	        "respuestas TEXT,"+
	        "fcreacion DATETIME)",[]);
	    tx.executeSql("DELETE FROM preguntas WHERE id=112");
	 }

	 this.addFirstData = function(datos){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	 		function (tx){
	 				//BORRAR
	 				/*for(datos.examenes as val){
	 					var sql = "SELECT id FROM preguntas WHERE examen_id=".val[id];
	 					tx.executeSql(sql,[],function (tx, results){
	 						var len = results.rows.length,
	                        i = 0;
		                    for (; i < len; i = i + 1) {
		                        console.log(results.rows.item(i).id);
		                    }
	 					})
	 				}*/
	 				

			 		var total = datos.examenes.length;
			 		var sql = "INSERT OR REPLACE INTO examenes " +
		            "(ID, nombre, fcreacion) " +
		            "VALUES (?, ?, ?)";
		            var e;
			 		for(var a = 0; a < total; a++){
			 			e = datos.examenes[a];
		            	tx.executeSql(sql, [e.id, e.nombre, e.fcreacion],
		                function () {
		                    //console.log('INSERT success');
		                },
		                function (tx, error) {
		                    console.log('INSERT error: ' + error.message);
		                });	
			 		}
			 		total = datos.preguntas.length;
			 		sql = "INSERT OR REPLACE INTO preguntas " +
		            "(ID, pregunta, examen_id)" +
		            "VALUES (?, ?, ?)";
			 		for(a = 0; a < total; a++){
			 			e = datos.preguntas[a];
		            	tx.executeSql(sql, [e.id, e.pregunta, e.examen_id],
		                function () {
		                    //console.log('INSERT success');
		                },
		                function (tx, error) {
		                    console.log('INSERT error: ' + error.message);
		                });	
			 		}
			 		total = datos.respuestas.length;
			 		sql = "INSERT OR REPLACE INTO respuestas " +
		            "(ID, respuesta, pregunta_id, correcta)" +
		            "VALUES (?, ?, ?, ?)";
		            var total2=0;
			 		for(var c = 0; c < total; c++){
			 			e = datos.respuestas[c];
		            	tx.executeSql(sql, [e.id, e.respuesta, e.pregunta_id, e.correcta],
		                function () {
		                    //console.log('INSERT success '+c);
		                    total2++;
		                    if(total2==total){
		                    	console.log('hecho');
		                    	deferred.resolve("ok");
		                    }
		                    //if(c==total){
		                    	//alert("ok");
		                    	//deferred.resolve("ok");
		                    //}
		                },
		                function (tx, error) {
		                    console.log('INSERT error: ' + error.message);
		                });	
			 		}
	 		},
	        function (error) {
	                console.log("Transaction Error: " + error.message);
	        }

	 	)
		return deferred.promise();
	 }

	 /* USUARIOS */
	 
	 /*OBTENER USUARIOS*//////////////////////////////////////////////////
	 this.traerUsuarios = function(){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	        function (tx) {

	                var sql = "SELECT * FROM usuarios";

	                tx.executeSql(sql, [], function (tx, results) {
	                    var len = results.rows.length,
	                        usuarios = [],
	                        i = 0;
	                    for (; i < len; i = i + 1) {
	                        usuarios[i] = results.rows.item(i);
	                    }
	                    deferred.resolve(usuarios);

	                });
	        },
	        function (error) {
	                deferred.reject("Transaction Error: " + error.message);
	        }
    	);
    	return deferred.promise();
	 }
	 /////////*FIN OBTENER USUARIO *///////////////////////////////////////

	 /*Validar USUARIO*///////////////////////////////////////////
	 this.validarUsuario = function(datos){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	 		function (tx){
	 			var sql = "SELECT * FROM usuarios WHERE email = '"+datos.email+"' AND pass='"+datos.pass+"'";
	 			tx.executeSql(sql, [], function (tx, results) {
	 					console.log("TOTAL "+results.rows.length);
	                    if(results.rows.length > 0){
	                    	deferred.resolve(results.rows.item(0));
	                	}else{
	                		deferred.resolve(0);
	                	}
		            });
		    },	
		    function (error) {
	                console.log("Transaction Error: " + error.message);
	        }
	 	);
	 	return deferred.promise();
	 }
	 /////////*FIN VALIDAR USUARIO*//////////////////////////////
	 

	 /*Guardar USUARIO*//////////////////////////////
	 this.guardarUsuario = function(datos){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	 		function (tx){
			 		var sql = "INSERT INTO usuarios " +
		            "(ID, nombre, apellido, email, pass, nivel, estado, terminos, recupero, fcreacion) " +
		            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		            tx.executeSql(sql, [datos.ID, datos.nombre, datos.apellido, datos.email, datos.pass, "usuario", datos.estado, datos.terminos, "",datos.fcreacion],
		            function (tx, results) {
		                    //console.log('INSERT success');
		                    deferred.resolve(results.insertId);
		            },
		            function (tx, error) {
		                console.log('INSERT error: ' + error.message);
		            });	
	 		},
	        function (error) {
	                console.log("Transaction Error: " + error.message);
	        }

	 	)
		return deferred.promise();
	 }
	 //////////////*FIN GUARDAR USUARIO*////////////////////////////////////////
	 /* EXAMENES */
	 this.traerExamenes = function(){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	        function (tx) {

	                var sql = "SELECT * FROM examenes";

	                tx.executeSql(sql, [], function (tx, results) {
	                    var len = results.rows.length,
	                        examenes = [],
	                        i = 0;
	                    for (; i < len; i = i + 1) {
	                        examenes[i] = results.rows.item(i);
	                    }
	                    deferred.resolve(examenes);

	                });
	        },
	        function (error) {
	                deferred.reject("Transaction Error: " + error.message);
	        }
    	);
    	return deferred.promise();
	 }
	 this.nombreExamen = function(id){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	 		function (tx){
	 			var sql = "SELECT nombre FROM examenes WHERE id="+id;
	                tx.executeSql(sql, [], function (tx, results) {
	                    deferred.resolve(results.rows.item(0).nombre);

	 		})
	                },
	        function (error) {
	                deferred.reject("Transaction Error: " + error.message);
	        }
    	);
    	return deferred.promise();
	 }
	 this.traerPregunta = function(id,cual){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	        function (tx) {

	                var sql = "SELECT * FROM preguntas WHERE examen_id="+id+" LIMIT "+cual+",1";

	                tx.executeSql(sql, [], function (tx, results) {
	                    var len = results.rows.length,
	                        preguntas = [],
	                        i = 0;
	                    for (; i < len; i = i + 1) {
	                        preguntas[i] = results.rows.item(i);
	                    }
	                    deferred.resolve(preguntas);

	                });
	        },
	        function (error) {
	                deferred.reject("Transaction Error: " + error.message);
	        }
    	);
    	return deferred.promise();
	 }

	 this.cantidadPreguntas = function(examenId){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	        function (tx) {

	                var sql = "SELECT COUNT(id) as total FROM preguntas WHERE examen_id="+examenId;

	                tx.executeSql(sql, [], function (tx, results) {
	                    deferred.resolve(results.rows.item(0).total);
	                });
	        },
	        function (error) {
	                deferred.reject("Transaction Error: " + error.message);
	        }
    	);
    	return deferred.promise();
	 }
	 this.traerRespuestas = function(preguntaId){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	        function (tx) {

	                var sql = "SELECT * FROM respuestas WHERE pregunta_id="+preguntaId;

	                tx.executeSql(sql, [], function (tx, results) {
	                    var len = results.rows.length,
	                        respuestas = [],
	                        i = 0;
	                    for (; i < len; i = i + 1) {
	                        respuestas[i] = results.rows.item(i);
	                    }
	                    deferred.resolve(respuestas);

	                });
	        },
	        function (error) {
	                deferred.reject("Transaction Error: " + error.message);
	        }
    	);
    	return deferred.promise();
	 }

	 this.guardarEvaluacion = function(datos){
	 	var deferred = $.Deferred();
	 	var fecha = new Date;
	 	fecha = fecha.getDate() + "/" + (fecha.getMonth() +1) + "/" + fecha.getFullYear();
	 	var momento = new Date;
	 	momento.setTime(momento.getTime());
		momento = momento.getHours()+":"+momento.getMinutes()+":"+momento.getSeconds();
		fecha = fecha+" "+momento;
		//console.log("FECHA ="+fecha);
		this.db.transaction(
	 		function (tx){
	 			if(datos.accion){
	 				sql = "UPDATE evaluaciones SET interrupcion=?, tiempo=?, correctas=?, puntaje=?, estado=1, respuestas=?, fcreacion=? WHERE id=?";
			 		tx.executeSql(sql, [datos.interrupcion, datos.tiempo, datos.correctas, datos.puntaje, datos.eleccion, fecha, datos.id],
				    function () {
				    	console.log("HIZO UPDATE DE EVA CON PUNTAJE");
				    	console.log(datos.eleccion);
				        deferred.resolve("ok");
				    },
				    function (tx, error) {
				        console.log('INSERT error: ' + error.message);
				    });
	 			}else{
			 		if(datos.id  > 0){
				 		sql = "UPDATE evaluaciones SET interrupcion=?, tiempo=?, correctas=?, respuestas=?, fcreacion=? WHERE id=?";
				 		tx.executeSql(sql, [datos.interrupcion, datos.tiempo, datos.correctas, datos.eleccion+", ", fecha, datos.id],
					    function () {
					        console.log("HIZO UPDATE DE EVA");
					        deferred.resolve("ok");
					    },
					    function (tx, error) {
					        console.log('INSERT error: ' + error.message);
					    });
			 		}else{
				 		sql = "INSERT INTO evaluaciones " +
					            "(usuario_id, examen_id, estado, fcreacion)" +
					            "VALUES (?, ?, ?, ?)";
					    tx.executeSql(sql, [datos.usuario, datos.examen, 0, fecha],
					    function (tx, results) {
					    	console.log('guardo Evaluacion')
					        console.log('INSERT success evaluaciones'+results.insertId);
							deferred.resolve(results.insertId);
					    },
					    function (tx, error) {
					        console.log('INSERT error: ' + error.message);
			            });	
					}
				}
			 },
	        function (error) {
	                console.log("Transaction Error: " + error.message);
	        }
	 	)
		return deferred.promise();
	 	//evaluaciones (ID, usuario_id,examen_id,estado,interrupcion,tiempo,correctas,puntaje,fcreacion)
	 }

	 /*BORRAR EVALUACIONES PENDIENTES*//////////////////////////////////
	 this.borrarEvPendientes = function(){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	        function (tx) {

	                var sql = "DELETE FROM evaluaciones WHERE estado = 0";

	                tx.executeSql(sql, [], function (tx) {
	                    deferred.resolve("ok");
	                });
	        },
	        function (error) {
	                deferred.reject("Error");
	        }
    	);
    	return deferred.promise();
	 }
	 ////////////*FIN Borrar evaluaciones pendientes*/////////////////////

	 /*BORRAR EVALUACION SELECCIONADA*//////////////////////////////////
	 this.borrarEvSelect = function(id){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	        function (tx) {

	                var sql = "DELETE FROM evaluaciones WHERE id = "+id;

	                tx.executeSql(sql, [], function (tx) {
	                    deferred.resolve("ok");
	                });
	        },
	        function (error) {
	                deferred.reject("Error");
	        }
    	);
    	return deferred.promise();
	 }
	 ////////////*FIN Borrar evaluacion seleccionada*/////////////////////

	 this.traerEvaluacion = function (id){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	        function (tx) {

	                var sql = "SELECT * FROM evaluaciones WHERE id="+id;

	                tx.executeSql(sql, [], function (tx, results) {
	                    var len = results.rows.length,
	                        evaluaciones = [],
	                        i = 0;
	                    for (; i < len; i = i + 1) {
	                        evaluaciones[i] = results.rows.item(i);
	                    }
	                    deferred.resolve(evaluaciones);

	                });
	        },
	        function (error) {
	                deferred.reject("Transaction Error: " + error.message);
	        }
    	);
    	return deferred.promise();
	 }
	 this.traerEvaluaciones = function(usuarioID){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	 		function(tx){
	 			var sql = "SELECT ev.*,ex.nombre as nombre FROM evaluaciones ev,examenes ex WHERE ev.examen_id = ex.ID AND ev.usuario_id ="+usuarioID+" AND ev.estado = 1 ORDER BY ev.fcreacion ASC, ev.examen_id ASC";
	 			tx.executeSql(sql, [], function(tx,results){
	 				var len = results.rows.length,
	 					evaluaciones = [],
	 					i = 0;
	 				for(; i < len; i = i + 1){
	 					evaluaciones[i] = results.rows.item(i);
	 				}
	 				deferred.resolve(evaluaciones);
	 			});
	 		});
	 	return deferred.promise();
	 }
	 this.verSiHayInyerrumpidas = function(usuarioID){
	 	var deferred = $.Deferred();
	 	this.db.transaction(
	 		function(tx){
	 			var sql = "SELECT * FROM evaluaciones WHERE usuario_id = "+usuarioID+" AND estado = 0";
	 			tx.executeSql(sql, [], function(tx,results){
	 				var len = results.rows.length,
	 				interrumpidas = [],
	 				i = 0;
	 				for(; i < len; i = i + i){
	 					interrumpidas[i] = results.rows.item(i);
	 				}
	 				deferred.resolve(interrumpidas);
	 			})
	 		},
	 		function (error) {
	                deferred.reject("Transaction Error: " + error.message);
	        }
    	);
    	return deferred.promise();
	 }

	 this.verSiEstaInterrumpida = function(datos){
	 	var deferred = $.Deferred();
	 	var usuario = datos.usuario;
	 	var examen = datos.examen;
	 	this.db.transaction(
	        function (tx) {

	                var sql = "SELECT * FROM evaluaciones WHERE usuario_id="+usuario+" AND examen_id="+examen+" AND estado=0";

	                tx.executeSql(sql, [], function (tx, results) {
	                    var len = results.rows.length,
	                        respuestas = [],
	                        i = 0;
	                    for (; i < len; i = i + 1) {
	                        respuestas[i] = results.rows.item(i);
	                    }
	                    deferred.resolve(respuestas);

	                });
	        },
	        function (error) {
	                deferred.reject("Transaction Error: " + error.message);
	        }
    	);
    	return deferred.promise();
	 }
	 this.traerRanking = function(){
	 	 
	 }
	 this.borrarEvaluacionesDe = function(datos){
	 	var usuario = datos.usuario;
	 	var examen = datos.examen;
	 	this.db.transaction(
	        function (tx) {

	                var sql = "DELTE FROM evaluaciones WHERE usuario_id="+usuario+" AND examen_id="+examen+" AND estado=0";

	                tx.executeSql(sql, [], function (tx, results) {
	                    deferred.resolve("ok");
	                });
	        },
	        function (error) {
	                deferred.reject("Transaction Error: " + error.message);
	        }
    	);
    	return deferred.promise();
	 }

 }
