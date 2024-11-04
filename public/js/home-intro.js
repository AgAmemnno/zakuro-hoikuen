function splitString(str){
    let splittedTextHtml='',generatedHTML='';
    let string = str.textContent;
    let i;
    for(i=0;i<string.length;i++){
      splittedTextHtml += `
      <span char="${string[i]}" style="--totalChars:${string.length};--index:${i};--delay:${i*100}ms;--duration:${string.length*100}ms">
      ${string[i]}
      </span>`;
    }
    
    generatedHTML = `<div>${splittedTextHtml}</div>`
    str.innerHTML = generatedHTML;
  }
  
function splittingInit(){
    let splitCharArr = document.querySelectorAll('.split-text');
    splitCharArr.forEach((str)=>{
    splitString(str);
    })
}
  
$( document ).ready(function() {
    splittingInit();
    init();

});


import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/addons/shaders/DotScreenShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


/*https://threejs.org/examples/?q=parti#webgl_points_dynamic*/
//import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { FocusShader } from 'three/addons/shaders/FocusShader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';


import { Reflector } from 'three/addons/objects/Reflector.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let container, stats, clock, controls,composer;
let camera, scene, renderer, mixer,loader,model,skeleton;
var lastTimestamp =  0;
var currentTime = 0;
var numAnimations = 0;
var requestId;
var initialized = false;
var position;
let panelSettings;
let groupPoints;
const meshes = [], clonemeshes = [];

const Config = {
    offset  : [-124,-1886,-1000],
	speed : 60
}
let currentBaseAction = 'idle';
const allActions = [];

var  GUION = false;

var baseActions = {
    idle: { weight: 0 },
    walk: { weight: 0 },
    run: { weight: 1 },
    camera    : { weight: 1 }
};

var additiveActions = {
    sneak_pose: { weight: 0 },
    sad_pose: { weight: 0 },
    agree: { weight: 0 },
    headShake: { weight: 0 }
};

function rad2deg(radians)
{
  // Store the value of pi.
  var pi = Math.PI;
  // Multiply radians by 180 divided by pi to convert to degrees.
  return radians * (180/pi);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
	if( post.COMPON){
		composer.setSize( window.innerWidth, window.innerHeight );
		if(post.effectFocus != null){
			post.effectFocus.uniforms[ 'screenWidth' ].value = window.innerWidth * window.decePixelRatio;
			post.effectFocus.uniforms[ 'screenHeight' ].value = window.innerHeight * window.devicePixelRatio;
			//effectFocus.uniforms[ 'sampleDistance'] = 0.01;
			//effectFocus.uniforms[ 'waveFactor'] = 0.1;
			Config.plane.getRenderTarget().setSize(
				window.innerWidth * window.devicePixelRatio,
				window.innerHeight * window.devicePixelRatio
			)
		}
	}
}

class ObjectParser{
    Names = {}
    Objs =  {}
    dummy = new THREE.Object3D();
    arrayAnim = []
    arrayMesh = []
    gltf(data,scene){
        model = data.scene;
        model.children.forEach((obj)=>{
            if(obj.isCamera){
                console.log("camera");
            }else if(obj.isObject3D){
                var prop = this.parseMod(scene,obj.name);
                if(prop != []){
                     this.apply(obj,scene,prop,model);
                }

                
            }
            
        })

        scene.children.forEach((obj)=>{
            if(obj.isGroup){
                    this.materials(obj);
            }
        }
                              )
		this.set= false;
    }
    apply(obj,scene,prop,model){
        if(prop[0] == "Array"){
            this.array(obj,scene,prop,model);
        }
    }
    array(obj,scene ,prop,model){
        
        const wrap = new THREE.Group(); 
        
        wrap.name = `${obj.name}-array`;
        for(let i = 0;i< prop[1];i++){
            const plane = new THREE.Mesh(  obj.geometry, obj.material);
            wrap.add(plane); 
        }
        var scene_orig,empty;

       
        var fnd = false;
        for(let i= 0;i< scene.children.length;i++){
             var o = scene.children[i];
            if(o.type == "Group"){
                for(let j= 0;j< o.children.length;j++){
                    var o2 = o.children[j];
                    if( prop[2] == o2.name){
                         fnd = true;
                         empty = o2;
                         o2.visible = false;
                     } 
                    if( obj.name == o2.name){
                         scene_orig = o2;
                     } 
                }
            }
        }
        
        if(!fnd){
            //scene.add( obj);
            return;
        }
		var name2 = empty.name.split("#");
		if(name2.length>1){
			 this.arrayMesh.push( [scene_orig,wrap,empty,name2[1]]);
			 this.arrayAnim.push(false);
			 baseActions[ name2[1]] =  { weight: 1 };
		}else{
			 this.arrayMesh.push( [scene_orig,wrap,empty,null]);
			 this.arrayAnim.push(false);
		}
       
        scene.add(wrap); 
    }
    
    parseMod(scene,name){
        let prop = name.split("-");
        if(prop.length > 2){
            if(prop[1] == "Row"){
                this.Names[name] = [ "Row"]
            }else
            if(prop[1] == "Array"){
                if(prop.length != 4){
                    console.error("model error Array prop length != 4")
                }else{
                    this.Names[name] = [ "Array", Number(prop[2]), prop[3] ] 
                }
            }
            return this.Names[name]
        }
         return []
    }
    print(msg,m){
        console.log(msg)
        console.log(`${m.elements[0]} ${m.elements[1]} ${m.elements[2]} ${m.elements[3]} `);
        console.log(`${m.elements[4]} ${m.elements[5]} ${m.elements[6]} ${m.elements[7]} `)
        console.log(`${m.elements[8]} ${m.elements[9]} ${m.elements[10]} ${m.elements[11]} `)
        console.log(`${m.elements[12]} ${m.elements[13]} ${m.elements[14]} ${m.elements[15]} `)
        
    }
	printV(msg,m){
        console.log(msg)
        console.log(`${m.x} ${m.y} ${m.z}  `);
        
    }
	printE(msg,m){
        console.log(msg)
        console.log(`${rad2deg(m.x)} ${rad2deg(m.y)} ${rad2deg(m.z)}  `);
    }
	eulerAdd(e1,e2){
		return new THREE.Euler( Number((e1.x + e2.x).toFixed(6)),  Number((e1.y + e2.y).toFixed(6)), Number((e1.z + e2.z).toFixed(6)));
	}
	eulerSub(e1,e2){
		return new THREE.Euler(  Number( (e1.x - e2.x).toFixed(6) ),  Number( (e1.y - e2.y).toFixed(6) ),  Number((e1.z - e2.z).toFixed(6)));
	}
	addMatrix( m1 ,m2 ) {
		const te = m1.elements;
		const me = m2.elements;
		te[ 0 ] = te[ 0 ] + me[ 0 ]; 
		te[ 1 ] = te[ 1 ] + me[ 1 ]; 
		te[ 2 ] = te[ 2 ] + me[ 2 ]; 
		te[ 3 ] = te[ 3 ] + me[ 3 ]; 
		te[ 4 ] = te[ 4 ] + me[ 4 ]; 
		te[ 5 ] = te[ 5 ] + me[ 5 ]; 
		te[ 6 ] = te[ 6 ] + me[ 6 ]; 
		te[ 7 ] = te[ 7 ] + me[ 7 ]; 
		te[ 8 ] = te[ 8 ] + me[ 8 ]; 
		te[ 9 ] = te[ 9 ] + me[ 9 ]; 
		te[ 10 ] = te[ 10 ] + me[ 10 ]; 
		te[ 11 ] = te[ 11 ] + me[ 11 ]; 
		te[ 12 ] = te[ 12 ] + me[ 12 ]; 
		te[ 13 ] = te[ 13 ] + me[ 13 ]; 
		te[ 14 ] = te[ 14 ] + me[ 14 ]; 
		te[ 15 ] = te[ 15 ] + me[ 15 ]; 
		return m1;
	}
	subMatrix( m1 ,m2 ) {
		const te = m1.elements;
		const me = m2.elements;
		te[ 0 ] = te[ 0 ] - me[ 0 ]; 
		te[ 1 ] = te[ 1 ] - me[ 1 ]; 
		te[ 2 ] = te[ 2 ] - me[ 2 ]; 
		te[ 3 ] = te[ 3 ] - me[ 3 ]; 
		te[ 4 ] = te[ 4 ] - me[ 4 ]; 
		te[ 5 ] = te[ 5 ] - me[ 5 ]; 
		te[ 6 ] = te[ 6 ] - me[ 6 ]; 
		te[ 7 ] = te[ 7 ] - me[ 7 ]; 
		te[ 8 ] = te[ 8 ] - me[ 8 ]; 
		te[ 9 ] = te[ 9 ] - me[ 9 ]; 
		te[ 10 ] = te[ 10 ] - me[ 10 ]; 
		te[ 11 ] = te[ 11 ] - me[ 11 ]; 
		te[ 12 ] = te[ 12 ] - me[ 12 ]; 
		te[ 13 ] = te[ 13 ] - me[ 13 ]; 
		te[ 14 ] = te[ 14 ] - me[ 14 ]; 
		te[ 15 ] = te[ 15 ] - me[ 15 ]; 
		return m1;
	}
    update(scene){
       
        this.arrayMesh.forEach((o,i) =>{
            if(!this.arrayAnim[i]){
			var org = o[0],mesh = o[1],empty = o[2],animName  = o[3]; 

            //rot.copy(org.rotation );
            if(o[3]== null){
				this.arrayAnim[i] = true;
			}
				
		    var erot = new THREE.Euler(-empty.rotation.x,empty.rotation.y - Math.PI,empty.rotation.z + Math.PI);

			var A = new THREE.Matrix4();
			A.copy(org.matrix).invert();
			//this.subMatrix(A,empty.matrix )

			var X = new THREE.Matrix4();
			X.copy(empty.matrix);
			A.multiply(X);
		    X.copy(org.matrix);

            var prop = this.Names[org.name];
            const amount = mesh.children.length;

            for ( let x = 0; x < amount; x ++ ) {
                var obj = mesh.children[x];
				X.multiply(A);
				X.decompose(obj.position,obj.quaternion,obj.scale);
				obj.updateMatrix();
                //obj.updateMatrixWorld( true );

				
		

            }
			
			//this.printV(`Empty position  `, empty.position);
		    //this.printV(`Org position    `, org.position);
			}
        })
    }
    materials(obj){
        obj.children.forEach((o) =>{
            if(o.hasOwnProperty("material")){
                var name = o.material.name.split("-");
                if(name.length > 1){
                    if(name[1] == "trans"){
                        //this.transparent(o.material);
                    }
                }
            }
        })
        
    }
    transparent(material){
					//material.color: params.color,
					//material.metalness: params.metalness,
					//material.roughness: params.roughness,
					//material.ior: params.ior,
					//material.alphaMap: texture,
					//material.envMap: hdrEquirect,
					//material.envMapIntensity: params.envMapIntensity,
					material.transmission = 1;
					material.specularIntensity = 0.4;
					//material.specularColor
					//material.opacity = 
					material.side= THREE.DoubleSide;
					material.transparent= true;
        }
}




class Days{
    timeList = [15,17,20,21,24,3,5,9]
    Params = {
        15:{
            rayleigh: 0.214,
            mieCoefficient: 0.0004,
            azimuth: -95,
			elevation: 80,
            exposure: 0.04
        },
        17:{
            rayleigh: 3.9,
            mieCoefficient:  0.0008,
            azimuth: -110,
			elevation: 90,
            exposure: 0.01
        },  
        20:{
            rayleigh: 0,
            mieCoefficient: 0.0008,
            azimuth: -180,
			elevation: 90,
            exposure: 0.1
        },  
        
		21:{
            rayleigh: 0,
            mieCoefficient: 0.0008,
            azimuth:   -100,
			elevation: 60,
            exposure: 0.02
        },  
		
		24:{
            rayleigh: 0.018,
            mieCoefficient: 0.0008,
            azimuth:  -85,
			elevation: 80,
            exposure: 0.001
        }, 
		
		3:{
            rayleigh: 0.018,
            mieCoefficient: 0.0008,
            azimuth:  -65,
			elevation: 85,
            exposure: 0.001
        },
		
		5:{
            rayleigh: 0.755,
            mieCoefficient: 0.048,
            azimuth:  -66,
			elevation: 90,
            exposure: 0.0044
        },
			
		9:{
            rayleigh: 0.214,
            mieCoefficient: 0.048,
            azimuth:  -80,
			elevation: 80,
            exposure: 0.04
        },
		
    };	

	create(scene,renderer){
		var ipara  = this.Params[15];
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 0.5;
		this.renderer = renderer;
		this.sky = new Sky();
		this.sky.scale.setScalar( 450000 );
		scene.add( this.sky );
		this.sun = new THREE.Vector3();
		var effectController = this.effectController = {
					//turbidity: 10,
					rayleigh:ipara.rayleigh,
					mieCoefficient: ipara.mieCoefficient,
					//mieDirectionalG: 0.7,
					elevation: 10,
					azimuth: 170,
					exposure: ipara.exposure
		};

		if(GUION){ 
		
            const gui = new GUI();
	        
            //gui.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange(this.updateUniformGUI);
            gui.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange(  this.updateUniformGUI);
            gui.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( this.updateUniformGUI);
            //gui.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange(  this.updateUniformGUI);
            gui.add( effectController, 'elevation', 0, 90, 0.1 ).onChange( this.updateUniformGUI);
            gui.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange(  this.updateUniformGUI);
            gui.add( effectController, 'exposure', 0, 1, 0.0001 ).onChange( this.updateUniformGUI);
			
            this.gui = gui;
            this.updateUniformGUI();
        }else{
			this.updateUniform();
	    }
	}

	createBG(){
		var bg = 0x060519;// 0x000104 
		scene.background = new THREE.Color(bg);
		scene.fog = new THREE.FogExp2(bg, 0.0000675 );
	}
	
	updateUniform() {

		const uniforms = tDay.sky.material.uniforms;
		const effectController = tDay.effectController;
		
		//uniforms[ 'turbidity' ].value = effectController.turbidity;
		uniforms[ 'rayleigh' ].value = effectController.rayleigh;
		uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
		//uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;
		const theta = THREE.MathUtils.degToRad(effectController.elevation);
		const phi = THREE.MathUtils.degToRad( 90 - effectController.azimuth);
		tDay.sun.setFromSphericalCoords( 1,  theta ,phi);
		uniforms[ 'sunPosition' ].value.copy(tDay.sun );
		//tDay.renderer.toneMappingExposure = effectController.exposure;
		//console.log("exp ", tDay.renderer.toneMappingExposure);
	}
	
	updateUniformGUI() {

		const uniforms = tDay.sky.material.uniforms;
		const effectController = tDay.effectController;
		
		//uniforms[ 'turbidity' ].value = effectController.turbidity;
		uniforms[ 'rayleigh' ].value = effectController.rayleigh;
		uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
		const theta = THREE.MathUtils.degToRad(effectController.elevation);
		const phi = THREE.MathUtils.degToRad( 90 - effectController.azimuth);
		tDay.sun.setFromSphericalCoords( 1,  theta ,phi);
		uniforms[ 'sunPosition' ].value.copy(tDay.sun );
		tDay.renderer.toneMappingExposure = effectController.exposure;

	}
	lastTime = 0;
	updateGUI(e) {
	
	    var VIDEO_INIT = 0,
	        VIDEO_END = Parser.maxDur*24,
	        auxTime;
	
	    auxTime = currentTime + e;
	    
	    Parser.perDur = 100.* (mixer.time / Parser.maxDur);
		if( (!this.setTime) && ((Parser.perDur % 100.) < 1)){
			this.lastTime = performance.now();
			this.setTime = true;

		}else if( this.setTime && (Parser.perDur % 100.) > 99. ){
			const thisTime = performance.now();
			const second = (thisTime- this.lastTime)/1000.;
			this.setTime = false;
			console.log("time ",second);
		}
		//console.log("time duration ",Parser.perDur);
		
	    if (auxTime <= VIDEO_END & auxTime >= VIDEO_INIT) {
			//console.log("time duration auxTime ",auxTime,"  e ",e,"  currenttime",currentTime );
	        currentTime = auxTime;
	        var cooD = e;
	        position =  parseInt(currentTime*10, 10);
	        mixer.update( cooD*0.1 );
	        Parser.update(scene);
	    }else{
			//console.log("time duration e < 0 auxTime  ",auxTime,"  e ",e,"  currenttime",currentTime );
		}
		
	    if(GUION){
			this.updateUniformGUI();
		}else{
			this.updateUniform();
		}
	    //renderer.render(scene, camera);
	    //startAnimation()
	}
	timerStart = false;
	timerOn(e){
		if(!this.timerStart){
			var updateScale = false;
			var switchSpan = 5;
			var timeScale = 0.1;
	        switch (this.currentPhase) {
		        /* 0 ===> 15:00  */
		        case 15:
	            {
					this.timeSpan =  0.5;
					timeScale = 0.2;
					updateScale = true;
	                break;
		        }
			
					
	            /* 16 ===> 17:00  */
				case 17:
	            {
					this.timeSpan =  3;
					updateScale = true;
	                break;
	            }
	
	            /* 26 ===> 20:00  */
	            case 20:
	            {
					this.timeSpan =  3;
					updateScale = true;
	                break;
	            }
					
	            /* 36 ===> 21:00  */
				case 21:
	            {
	          
					this.timeSpan =  3;
					updateScale = true;
	                break;
	            }
					
	            /* 46 ===> 24:00  */
				case 24:
	            {
					this.timeSpan =  3;
					updateScale = true;
	                break;
	            }
					
	            /* 56 ===> 3:00  */
				case 3:
	            {
					this.timeSpan =  3;
					updateScale = true;
	                break;
	            }
	
	            /* 66 ===> 5:00  */
	            case 5:
	            {
					this.timeSpan =  3;
					updateScale = true;
	                break;
	            }
			   
				/* 86 ===> 9:00  */
	            case 9:
	            {
					this.timeSpan =  1;
					updateScale = true;
	                break;
	            }	
					
	        }
			if(updateScale){
				this.timeScale =timeScale;
				this.lastTime = performance.now();
				this.timerStart = true;
				//console.log("updateScale  e " ,e)
			}
		}
		//console.log("time duration ",Parser.perDur);
	}
	timeScale  =1.;
	timerOff(){
		if(this.timerStart){
			const thisTime = performance.now();
			const second = (thisTime- this.lastTime)/1000.;
			if(second > this.timeSpan){
				this.timerStart = false;
				this.timeScale = 1.;
				//console.log("time ",second);
			}
		}
	}
	
	updateTimeScale(e,diff){
		this.timerOn(e);
		this.timerOff();
		mixer.update( diff*this.timeScale);
	    Parser.update(scene);
		
	}
	updateOverlay(diff){
		
		var VIDEO_INIT = 0,
		VIDEO_END = Parser.maxDur*24,
		auxTime;
	
	    auxTime = currentTime + diff;
	    
	    Parser.perDur = 100.* (mixer.time / Parser.maxDur);
		let e = Parser.perDur % 100.;
		//console.log("time duration diff ",diff);
	    if((diff > -2.) && (diff < 2.) ){
			//console.log("time duration auxTime ",auxTime,"  e ",e,"  currenttime",currentTime );
	        currentTime = auxTime;
			this.updateTimeScale(e,diff);
	    }else{
			console.error("time duration e < 0 auxTime  ",auxTime,"  e ",e,"  currenttime",currentTime ," diff ",diff);
		}

		//console.log(e);
        switch (true) {
	        /* 0 ===> 15:00  */
	        case (e >0 && e < 26) :
            {
				//mixer.timeScale = 0.1;
			    pointsToggle(true);
                this.updateUniformByTime(15,e/26.);
                break;
	        }
            
            /* 16 ===> 17:00  */
            case (e >=26 && e < 36):
            {
				//mixer.timeScale = 0.3;
				pointsToggle(false);
                this.updateUniformByTime(17, (e-26)/10.);
                break;
            }

            /* 26 ===> 20:00  */
            case (e >=36 && e < 46): 
            {
                pointsToggle(true);
                this.updateUniformByTime(20, (e-36)/10.);
                break;
            }
				
            /* 36 ===> 21:00  */
            case (e >=46 && e < 56): 
            {
          
                pointsToggle(true);
                this.updateUniformByTime(21, (e-46)/10.);
                break;
            }
				
            /* 46 ===> 24:00  */
            case (e >=56 && e < 61): 
            {
                pointsToggle(true);
                this.updateUniformByTime(24, (e-56)/5.);
                break;
            }
				
            /* 56 ===> 3:00  */
            case (e >=61 && e < 66): 
            {
                pointsToggle(true);
                this.updateUniformByTime(3, (e-61)/5.);
                break;
            }

            /* 66 ===> 5:00  */
            case (e >=66 && e < 80): 
            {
                pointsToggle(true);
                this.updateUniformByTime(5, (e-66)/14.);
                break;
            }
		   
			/* 86 ===> 9:00  */
            case (e >=80 && e < 100): 
            {
                pointsToggle(true);
                this.updateUniformByTime(9, (e-80)/20.);
                break;
            }	
				

        }
        const coordinateDisplay = 10;
		var msgs = {
			'#msg-policy1' :false,
			'#msg-policy2' :false,
			'#msg-policy3' :false,
			'#msg-policy4' :false,
			'#msg-2' :false,
			'#msg-3' :false,
			'#msg-4' :false,
			'#msg-0' :false,
			'#msg-6' :false,
			'#msg-video' :false,
		}
        switch (true) {
	        /* 0 ===> 15:00  */
	        case (e >85 && e < 91) :
            {
				$('#msg-policy1').css("display", "block");
				msgs['#msg-policy1'] = true;
                break;
	        }
            
			case (e >91 && e < 100) :
            {
				$('#msg-policy2').css("display", "block");
				msgs['#msg-policy2'] = true;
                break;
	        }
			case (e >0 && e < 10) :
            {
				$('#msg-policy3').css("display", "block");
				msgs['#msg-policy3'] = true;
                break;
	        }		
		    case (e >10 && e < 26) :
            {
				$('#msg-policy4').css("display", "block");
				msgs['#msg-policy4'] = true;
                break;
	        }		
            /* 16 ===> 17:00  */
            case (e >=26 && e < (coordinateDisplay +26)):
            {
                $('#msg-2').css("display", "block");
				msgs['#msg-2'] = true;
                break;
            }

            /* 26 ===> 20:00  */
            case (e >=36 && e < (coordinateDisplay +36)):
            {
                $('#msg-3').css("display", "block");
				msgs['#msg-3'] = true;
                break;
            }
				
            /* 36 ===> 21:00  */
            case (e >=46 && e < (coordinateDisplay +46)):
            {
                $('#msg-4').css("display", "block");
				msgs['#msg-4'] = true;
                break;
            }
				
            /* 46 ===> 24:00  */
            case (e >=56 && e < (coordinateDisplay +56)):
            {
				
                $('#msg-video').css("display", "block");
				msgs['#msg-video'] = true;
				/*
				document.getElementById('video1').load();
				document.getElementById('video1').play();
				
				*/
                break;
            }
				
            /* 56 ===> 3:00  */
            case (e >=56 && e < (coordinateDisplay +56)):
            {

                //break;
            }

            /* 66 ===> 5:00  */
            case (e >=66 && e < (coordinateDisplay +66)):
            {
                $('#msg-6').css("display", "block");
				msgs['#msg-6'] = true;
                break;
            }
		   
			/* 86 ===> 9:00  */
            case (e >=80 && e < (85)):
            {
                $('#msg-0').css("display", "block");
				msgs['#msg-0'] = true;
                break;
            }	
        }
		
        for(let k in msgs){
			if(!msgs[k]){
                $(k).css("display", "none");
            }
        }
	}

    updateEase(t){
        const uniforms = tDay.sky.material.uniforms;
        let v = 0;
        for (let k in this.prePara) {
            if(k == "azimuth_elevation"){
                
                var v0 = this.prePara[k];
                var v1 = this.postPara[k];
				this.effectController.azimuth  = this.ease(t,v0[0],v1[0]-v0[0],1);
			    this.effectController.elevation = this.ease(t,v0[1],v1[1]-v0[1],1);
                

            }else if(k == "exposure") {
                tDay.renderer.toneMappingExposure = this.ease(t,this.prePara[k],this.postPara[k]-this.prePara[k],  1);
				
            }else{
                this.effectController[k] = this.ease(t,this.prePara[k],this.postPara[k] -this.prePara[k], 1);
            }
        }
    }

	updateUniformByTime(T,t){
		this.currentPhase = T;
		var i0 = this.timeList.indexOf(T);
		var l = this.timeList.length;
		var i1 = (i0+1) % l 
		var T1 = this.timeList[i1];
		this.prePara  = this.Params[T];
		this.postPara = this.Params[T1];

		switch(T){
			case 15:{
                this.ease = easeLinear;
                this.updateEase(t);
				break;
			};
			case 17:{
                this.ease = easeLinear;
                this.updateEase(t);
				break;
			};
			case 20:{
                this.ease = easeLinear;
                this.updateEase(t);
				break;
			};
			case 21:{
                this.ease = easeLinear;
                this.updateEase(t);
				break;
			};
			case 24:{
                this.ease = easeLinear;
                this.updateEase(t);
				break;
			};
			case 3:{
                this.ease = easeLinear;

                this.updateEase(t);
				break;
			};
			case 5:{
                this.ease = easeLinear;
                this.updateEase(t);
				break;
			};
			case 9:{
                this.ease = easeLinear;
                this.updateEase(t);
				break;
			};
			default:{
				break;
			}
		}		
		//console.log("T ",T ,"  t ",t );
	}
	
	updateOverlay0(e0){
	
	    //console.log('c:'+ e);
	    let e = Parser.perDur % 100.;
		//console.log(e);
	    if(e > 0 && e < 5){
	
	        $('.home-container').addClass('visible');
	    }
	
	    if(e > 5){
	        //console.log('c:'+ c);
	        $('.home-container').removeClass('visible');
	    }
	
	
	    if(e < 10){
	        //console.log('c:'+ c);
	        $('.message-1').removeClass('visible');
	    }
	
	
	    if(e >10 && e < 20){
	        //console.log('c:'+ c);
			if(e<16){
				pointsToggle(true);
			}else{
				pointsToggle(false);
			}
			
	        $('.message-1').addClass('visible');
			
	    }
	
	    if(e > 20){
	        //console.log('c:'+ c);
	        $('.message-1').removeClass('visible');
	    }
	
	    if(e < 23){
	        //console.log('c:'+ c);
	        $('.message-2').removeClass('visible');
	    }
	    if(e > 26){
	       pointsToggle(true);
	    }
	    if(e > 30  && e < 40){
	        //console.log('c:'+ c);
	        $('.message-2').addClass('visible');
	
	    }
	
	    if(e > 40){
	        //console.log('c:'+ c);
	        $('.message-2').removeClass('visible');
			
	    }
	
	    if(e < 50){
	        //console.log('c:'+ c);
	        $('.message-3').removeClass('visible');
			
	    }
	
	    if(e > 50 && e < 60){
	        //console.log('c:'+ c);
	        $('.message-3').addClass('visible');
	    }
	
	    if(e > 60){
	        //console.log('c:'+ c);
	        $('.message-3').removeClass('visible');
	    }
	
	    if(e < 60){
	        //console.log('c:'+ c);
	        $('.message-4').removeClass('visible');
	    }
	
	    if(e > 60  && e < 70){
	        //console.log('c:'+ c);
	        $('.message-4').addClass('visible');
			
	    }
	
	    if(e > 70){
	        //console.log('c:'+ c);
	        $('.message-4').removeClass('visible');
	    }
	
	    if(e < 80){
	        //console.log('c:'+ c);
	        $('.message-5').removeClass('visible');
	        //$('.message-5').css('z-index', 'auto');
	    }
	
	    if(e > 80){
			pointsToggle(true);
	        //console.log('c:'+ c);
	        $('.message-5').addClass('visible');
	        //$('.message-5').css('z-index', '3');
	
	    }
	
	}

	startAnimation() {
	    if (!requestId && !initialized) {
	        initialized = true;
	        requestId = window.requestAnimationFrame(() =>{
	            update(0);
	            startAnimation();
	        });
	    }
	}

    stopAnimation() {
	
	    if (requestId) {
	       // console.log('STOP loop')
	        window.cancelAnimationFrame(requestId);
	        requestId = undefined;
	    }
	}
	
	bindEventListeners() {
		
	    $('#home-intro-scroll-sensor').momentus({
	      
	        onChange: function (coords) {
				
	            //tDay.stopAnimation();
	            var progress = (coords.y - lastTimestamp);

	            var param = tDay.getParam(progress);
	            
				if(GUION){
				   tDay.updateGUI(param);
	               tDay.updateOverlay0(position);
				}else{
				   tDay.updateOverlay(param);
				   tDay.updateUniform();
				}
				
	            lastTimestamp = coords.y;
				//console.log("lastTimestamp ",lastTimestamp);
	
	        }
	    });
	
	};
    
	isMobile(){
	
	    var isMob = false; //initiate as false
	    // device detection
	    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
	        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMob = true;
	
	    return isMob;
	
	}

	getParam(progress) {
	
	
	    var isMob = tDay.isMobile();
	    // Opera 8.0+
	    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	    // Firefox 1.0+
	    var isFirefox = typeof InstallTrigger !== 'undefined';
	    // At least Safari 3+: "[object HTMLElementConstructor]"
	    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	    // Internet Explorer 6-11
	    var isIE = /*@cc_on!@*/false || !!document.documentMode;
	    // Edge 20+
	    var isEdge = !isIE && !!window.StyleMedia;
	    // Chrome 1+
	    var isChrome = !!window.chrome && !!window.chrome.webstore;
	    // Blink engine detection
	    var isBlink = (isChrome || isOpera) && !!window.CSS;
	
	    if (!isMob){
	
	        //Ambiente desktop
	        if (isFirefox) {
	            return progress.toFixed(2) * -0.1;
	        }
	
	
	        //default tutti quelli che rimangono
	        return progress.toFixed(2) * -0.01;
	
	
	    }else {
	
	        // detect iPhone
	        if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
	            return progress.toFixed(2) * -0.005;
	
	        }
	
	        //default tutti quelli che rimangono
	        return progress.toFixed(2) * -0.1;
	
	    }
	
	}

}

class Post{
    eB_threshold = 0.103;
    eB_strength  = 0.492;
    eB_radius    = 0.15;
	COMP    =  false;
	COMP2   = true;
	COMPON  = this.COMP | this.COMP2 ;
	effectFocus=null;
	create(){
		var effectController = this.effectController = {
            eB_threshold : this.eB_threshold,
			eB_strength : this.eB_strength,
			eB_radius : this.eB_radius
		};
		
		if( this.COMP){
			
			composer = new EffectComposer( renderer );
			composer.addPass( new RenderPass( scene, camera ) );
		
			//const effect1 = new ShaderPass( DotScreenShader );
			//effect1.uniforms[ 'scale' ].value = 100;
			//composer.addPass( effect1 );
		
			const effect2 = new ShaderPass( RGBShiftShader );
			effect2.uniforms[ 'amount' ].value = 0.35;
			composer.addPass( effect2 );
		
			const effect3 = new OutputPass();
			composer.addPass( effect3 );
			
		}else if(this.COMP2){
			
			const renderModel = new RenderPass( scene, camera );
			//const effectBloom = new BloomPass(1.6);
			const effectFilm = new FilmPass();
			this.effectBloom = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
			this.effectBloom.threshold = effectController.eB_threshold;
			this.effectBloom.strength = effectController.eB_strength;
			this.effectBloom.radius = effectController.eB_radius;
			
			this.effectFocus = new ShaderPass( FocusShader );

		    if(GUION){
				
				const bloomFolder = tDay.gui.addFolder( 'bloom' );
				
				bloomFolder.add( effectController , 'eB_threshold', 0.0, 2.0 ).onChange( function ( value ) {
					//post.effectBloom.threshold = Number( value );
					post.effectFocus.uniforms["sampleDistance"].value = value;
				} );
				
				bloomFolder.add( effectController , 'eB_strength', 0.0, 1.0 ).onChange( function ( value ) {
					post.effectFocus.uniforms["waveFactor"].value = value;
					//post.effectBloom.srength = Number( value );
				} );
				
				tDay.gui.add( effectController , 'eB_radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
					post.effectBloom.radius = Number( value );
				} );
			}

		   
			this.effectFocus.uniforms[ 'screenWidth' ].value = window.innerWidth * window.devicePixelRatio;
			this.effectFocus.uniforms[ 'screenHeight' ].value = window.innerHeight * window.devicePixelRatio;
	
			const outputPass = new OutputPass();
	
			composer = new EffectComposer( renderer );
	
			composer.addPass( renderModel );
			composer.addPass( this.effectBloom );
			composer.addPass( effectFilm );
			//composer.addPass( this.effectFocus );
			composer.addPass( outputPass );
		}		
	}
}

var tDay = new Days();

var Parser = new ObjectParser();
var post   = new Post();

function createScene(){
	
    tDay.bindEventListeners();

	if(post.COMP2){
		scene.add( groupPoints );
	}

	
	const light = new THREE.DirectionalLight( 0xffffff, 3 );
	light.position.set( 1, 1, 1 );
	scene.add( light );
	
	const planeg = new THREE.PlaneGeometry( 100, 100 );
	const plane = new Reflector( planeg, {
		clipBias: 0.01,
		textureWidth: window.innerWidth * window.devicePixelRatio,
		textureHeight: window.innerHeight * window.devicePixelRatio,
		color: 0x252525
	} );
	plane.position.y = -2025 -100;
	plane.rotation.x = - Math.PI / 2;
	plane.scale.set( 1000, 1000, 1000 );

	Config.plane = plane;
	scene.add( plane );

 
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;
	container.appendChild( renderer.domElement );


	
	stats = new Stats();
	//container.appendChild( stats.dom );

	tDay.create(scene,renderer);	
	
	post.create();



	var param = tDay.getParam(lastTimestamp);
    tDay.updateOverlay(param);
    tDay.updateUniform();

	
	window.addEventListener( 'resize', onWindowResize );

	renderer.setAnimationLoop( animate );
	
}

function animate() {
    //tDay.update(lastTimestamp);
    render();
    //stats.update();
}

function pointsToggle(ud ){
    
	for ( let j = 0; j < meshes.length; j ++ ) {
		const data = meshes[ j ];
		// all vertices down
		if ( data.direction <0 && ud == false ) {
			data.direction = 1;
			data.speed = Config.speed/3;
			data.verticesDown = 0;
			data.delay = 320;
		}else if(data.direction >0 && ud == true ){
			data.direction = - 1;
			data.speed = Config.speed;
			data.verticesUp = 0;
			data.delay = 120;	
		}
	}
}

function pointsAnimation(){

	let delta = 1 * clock.getDelta();
    
	delta = delta < 2 ? delta : 2;


	//groupPoints.rotation.y += - 0.02 * delta;

	for ( let j = 0; j < clonemeshes.length; j ++ ) {

		const cm = clonemeshes[ j ];
		cm.mesh.rotation.y += - 0.1 * delta * cm.speed;

	}
    

	for ( let j = 0; j < meshes.length; j ++ ) {

		const data = meshes[ j ];
		const positions = data.mesh.geometry.attributes.position;
		const initialPositions = data.mesh.geometry.attributes.initialPosition;

		const count = positions.count;

		if ( data.start > 0 ) {
			data.start -= 1;
		}

		if ( data.direction === 0 ) {

			data.direction = - 1;

		}

        data.verticesUp = 0;
		data.verticesDown  = 0;
		for ( let i = 0; i < count; i ++ ) {

			const px = positions.getX( i );
			const py = positions.getY( i );
			const pz = positions.getZ( i );

			// falling down
			if ( data.direction < 0 ) {

				if ( py > -85) {
                    var w = 1./Math.abs(py);
					positions.setXYZ(
						i,
						px + w*60.5 * ( 0.50 - Math.random() ) * data.speed * delta,
						py + 3.0 * ( 0.25 - Math.random() ) * data.speed * delta,
						pz + w*40.5 * ( 0.50 - Math.random() ) * data.speed * delta
					);

				} else {
 
					data.verticesDown += 1;

				}

			}

			// rising up
			if ( data.direction > 0 ) {

				const ix = initialPositions.getX( i );
				const iy = initialPositions.getY( i );
				const iz = initialPositions.getZ( i );

				const dx = Math.abs( px - ix );
				const dy = Math.abs( py - iy );
				const dz = Math.abs( pz - iz );

				const d = dx + dy + dx;
                var speed2  = data.speed*4;
				if ( d > 30 ) {

					positions.setXYZ(
						i,
						px - ( px - ix ) / dx * speed2 * delta * ( 0.85 - Math.random() ),
						py - ( py - iy ) / dy * speed2 * delta * ( 1 + Math.random() ),
						pz - ( pz - iz ) / dz * speed2 * delta * ( 0.85 - Math.random() )
					);

				} else {

					data.verticesUp += 1;

				}

			}

		}



		positions.needsUpdate = true;

	}
	/*
	tDiffuse: { value: null },
	screenWidth: { value: 1024 },
	screenHeight: { value: 1024 },
	sampleDistance: { value: 0.94 },
	waveFactor: { value: 125e-5 }
	*/

	composer.render( 0.01);

}
	
function render() {
      
	if( post.COMPON){
		if( post.COMP){
			composer.render();
		}else if(post.COMP2){
			//composer.render();
			pointsAnimation();
		}
	}else{
    renderer.render( scene, camera );
	}
    //
}

function setWeight( action, weight ) {

    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );
}

function activateAction( action ) {

    const clip = action.getClip();
    const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
    setWeight( action, settings.weight );
    action.play();

}

function parseAnim(gltf,scene){
	
	model = gltf.scene;
	scene.add( model );
	
	var f = (c)=>{
       for(let o of c){
		   if(o.isGroup){
			   f(o.children);
		   }
		   if(o.isObject3D){
			   var n = o.name.split("-")[0].split("#");
			  // console.log(o.name,"    ",n);
			   if(n.length > 1){
				   baseActions[n[1]] =  {weight:1};
			   }
		   }
	   }
		
	}
	f(scene.children);
	
	scene.children[0].children[14].visible = false;
        
	Parser.gltf(gltf,scene);
	
	if(gltf.cameras.length > 0){
		if( (gltf.cameras[0] instanceof THREE.PerspectiveCamera)  ||  (gltf.cameras[0] instanceof THREE.OrthographicCamera) ){
				camera = gltf.cameras[0];
		}
	}
	
	if(camera == null){
		camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.set( 15, 10, - 15 );
	}
	camera.fov = 20;
	camera.far = 50000;

	const animations = gltf.animations;
	mixer = new THREE.AnimationMixer( model );

	numAnimations = animations.length;
	var maxDur  = 0;
	for ( let i = 0; i !== numAnimations; ++ i ) {

		let clip = animations[ i ];
		const name = clip.name;

		if ( baseActions[ name ] ) {

			const action = mixer.clipAction( clip );
			activateAction( action );
			baseActions[ name ].action = action;
			allActions.push( action );
			if(clip.duration > maxDur){
				maxDur = clip.duration;
			}

		} else if ( additiveActions[ name ] ) {

			// Make the clip additive and remove the reference frame

			THREE.AnimationUtils.makeClipAdditive( clip );

			if ( clip.name.endsWith( '_pose' ) ) {

				clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );

			}

			const action = mixer.clipAction( clip );
			activateAction( action );
			additiveActions[ name ].action = action;
			allActions.push( action );

		}

	}

	Parser.maxDur = maxDur;
	mixer.setTime ( 80.*maxDur/100.);
	mixer.timeScale = 0.4;
}

function loadAsset() {
    loader = new GLTFLoader();
    loader.load( 'resources/Xbot.glb', function ( gltf ) {
		parseAnim(gltf,scene);
        createScene();
    } );
}

function combineBuffer( model, bufferName ) {

	let count = 0;

	model.traverse( function ( child ) {

		if ( child.isMesh ) {

			const buffer = child.geometry.attributes[ bufferName ];

			count += buffer.array.length;

		}

	} );

	const combined = new Float32Array( count );

	let offset = 0;

	model.traverse( function ( child ) {

		if ( child.isMesh ) {

			const buffer = child.geometry.attributes[ bufferName ];

			combined.set( buffer.array, offset );
			offset += buffer.array.length;

		}

	} );

	return new THREE.BufferAttribute( combined, 3 );

}

function rondomArch(positions1, positions2, scene, color,color2,N){
	
	var depth  = -12209
	var scale  = 5 - (2*Math.random()-1)*3;
	var x  =   250;
	var y  =   150;
	var z  =   0;



	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute( 'position', positions1.clone() );
	geometry.setAttribute( 'initialPosition', positions1.clone() );

	geometry.attributes.position.setUsage( THREE.DynamicDrawUsage );
	
	const geometry2 = new THREE.BufferGeometry();
	geometry2.setAttribute( 'position', positions2.clone() );
	geometry2.setAttribute( 'initialPosition', positions2.clone() );

	geometry2.attributes.position.setUsage( THREE.DynamicDrawUsage );
	

	var mesh = null;
	var mesh2 = null;
	var psize = 0.1;
	for ( let i = 0; i < N; i ++ ) {

		mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { size: psize, color: color } ) );
		mesh2 = new THREE.Points( geometry2, new THREE.PointsMaterial( { size: psize *2, color: color2 } ) );
		
		mesh2.scale.x = mesh2.scale.y = mesh2.scale.z =  mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
        var offset = [ (2*Math.random()-1)*300,  - (2*Math.random()-1)*30,  depth/N*i - (2*Math.random()-1)*20  ];
		 
		var parity =   (i%2 ==0 )?1:-1;
		mesh2.position.x = mesh.position.x = parity * (x + offset[0]) + Config.offset[0];
		mesh2.position.y = mesh.position.y = y + offset[1]+ Config.offset[1];
		mesh2.position.z =  mesh.position.z = z + offset[2]+ Config.offset[2];

		groupPoints.add( mesh );
        groupPoints.add( mesh2 );
		clonemeshes.push( { mesh: mesh, speed: 0.5 + Math.random() } );
		clonemeshes.push( { mesh: mesh2, speed: 0.5 + Math.random() } );

	}
    var data  ={
		mesh: mesh, verticesDown: 0, verticesUp: 0, direction: 0, speed: Config.speed, delay: Math.floor( 200 + 200 * Math.random() ),
		start: Math.floor( 100 + 200 * Math.random() ),name:"huji"
	} 
	meshes.push(data);
	/*
	data  = data.clone();
	data.mesh = mesh2;
	data.Name = "tree"; 
	meshes.push(data);
	*/
}

function loadPointsDistruct(){
	const loader = new OBJLoader();
    groupPoints = new THREE.Object3D();


	const color = 0x6411ee;
	const color2 = 0x33ff55;
	
	loader.load( 'models/gocchaman.obj', function ( object ) {
        /*
		const positions = combineBuffer( object, 'position' );
    
		createMesh( positions, scene, scale, 0, 0, 0, 0xff7744 );
		createMesh( positions, scene, scale, 256, 0, depth/5, 0x4477ff );
		createMesh( positions, scene, scale, 0, 0, depth/3, 0xff7744 );
		createMesh( positions, scene, scale, 256, 0, depth/2, 0x44ff44 );

		*/
        loadAsset();
	} );

	loader.load( 'models/huji.obj', function ( object ) {
		
		const positions1 = combineBuffer( object, 'position' );

		loader.load( 'models/tree.obj', function ( tree) {
	
			const positions2 = combineBuffer( tree, 'position' );
			rondomArch(positions1, positions2, scene,  color,color2,20);
		} );
	} );

}

function init() {
	
    container = document.createElement('div');
    document.getElementById('home-intro').appendChild(container);
    container.id = 'wheel';
    
    scene = new THREE.Scene();

    clock = new THREE.Clock();
    
    loader = new GLTFLoader();
    loadPointsDistruct( );
	
}
