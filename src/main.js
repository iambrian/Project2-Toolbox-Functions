
// Skybox texture from: https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/skybox

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'


// 14 step motion: http://www.brendanbody.co.uk/flight_tutorial/
var state = 0;
var timeDelta = 100; // ms
var startTime;

var settings = {
    speed: 0.003,
    primaryColor: [ 91,	78,	60 ],
    secondaryColor: [ 76, 64, 47 ],
    tertiaryColor: [ 45, 37, 26 ],
    elbowX: 3,
    elbowZ: 5,
    wristX: 7,
    wristZ: 5,
    numLayers: 1,
    maxDensity: 40,
    density: 40,
    showCtrlPts: false
}

var featherConfig = {
    getName: function(segment, region, i, l) {
        return "feather(" + segment + "," + region + "," + i + "," + l + ")";
    },
    marginalCoverts: {
        segment: "se",
        region: "marginalCoverts",
        yaw: function(i) { return 1.6; },
        scale: function(i) { return [0.5 + (Math.random() - 0.5)/3, 1, 1]; },
        color: 1,
        yindex: 0,
        zindex: 0
    },
    secondaryCoverts: {
        segment: "se",
        region: "secondaryCoverts",
        yaw: function(i) { return 1.6; },
        scale: function(i) { return [1 + (Math.random() - 0.5)/2, 1, 1]; },
        color: 2,
        yindex: -0.05,
        zindex: -0.5
    },
    secondaries: {
        segment: "se",
        region: "secondaries",
        yaw: function(i) { return 1.6; },
        scale: function(i) { return [1.5 + (Math.random() - 0.5)/2, 1, 1]; },
        color: 3,
        yindex: -0.1,
        zindex: -1
    },
    alula: {
        segment: "ew",
        region: "alula",
        yaw: function(i) { return 1.6; },
        scale: function(i) { return [(10 - i)/20 + (Math.random() - 0.5)/3, 1, 1]; },
        color: 1,
        yindex: 0,
        zindex: 0
    },
    primaryCoverts: {
        segment: "ew",
        region: "primaryCoverts",
        yaw: function(i) { return 1.6/(1+Math.exp(i-7)); },
        scale: function(i) { return [1 + (Math.random() - 0.5)/2, 1, 1]; },
        color: 2,
        yindex: -0.05,
        zindex: -0.5
    },
    primaries: {
        segment: "ew",
        region: "primaries",
        yaw: function(i) { return 1.6/(1+Math.exp(i-7)); },
        scale: function(i) { return [1.5 + (Math.random() - 0.5)/2, 1, 1]; },
        color: 3,
        yindex: -0.1,
        zindex: -1
    }
};

var sections = [featherConfig.marginalCoverts,
                featherConfig.secondaryCoverts,
                featherConfig.secondaries,
                featherConfig.alula,
                featherConfig.primaryCoverts,
                featherConfig.primaries];

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}


// called after the scene loads
function onLoad(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    // Basic Lambert
    var lambertWhite = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    // Set light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    // set skybox
    var loader = new THREE.CubeTextureLoader();
    var urlPrefix = '/images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    scene.background = skymap;

    // load a simple obj mesh
    var objLoader = new THREE.OBJLoader();
    objLoader.load('/geo/feather.obj', function(obj) {
        var featherGeo = obj.children[0].geometry;
        for (var s = 0; s < sections.length; s++) {
            var config = sections[s];
            for (var l = 0; l < settings.numLayers; l++) {
                for (var i = 0; i < settings.density; i++) {
                    var fi = 10 * i / settings.density;
                    var featherMesh = new THREE.Mesh(featherGeo, lambertWhite);
                    featherMesh.name = featherConfig.getName(config.segment, config.region, i, l);
                    featherMesh.rotation.y = config.yaw(fi);
                    var scale = config.scale(fi);
                    featherMesh.scale.set(scale[0], scale[1], scale[2]);
                    scene.add(featherMesh);
                }
            }
        }
    });

    var geometry = new THREE.BoxGeometry(0,0,0 );
    var material = new THREE.MeshBasicMaterial( {color: 0xCB2400} );
    var shoulder = new THREE.Mesh( geometry, material );
    shoulder.position.set(0,0,5);
    shoulder.name = "shoulder";
    scene.add( shoulder );

    var geometry = new THREE.BoxGeometry( 0,0,0);
    var material = new THREE.MeshBasicMaterial( {color: 0xC67563} );
    var elbow = new THREE.Mesh( geometry, material );
    elbow.position.set(3,-3,5);
    elbow.name = "elbow";
    scene.add( elbow );


    var geometry = new THREE.BoxGeometry(0,0,0 );
    var material = new THREE.MeshBasicMaterial( {color: 0xCAA8A1} );
    var wrist = new THREE.Mesh( geometry, material );
    wrist.position.set(7,-7,5);
    wrist.name = "wrist";
    scene.add( wrist );

    // beak
    var geometry = new THREE.CylinderGeometry( 0.01, 0.5, 2, 5 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.set(0,0,6);
    cylinder.rotation.x = 2;
    scene.add( cylinder );

    // head
    var geometry = new THREE.CylinderGeometry( 0.7, 0.8, 1, 5 );
    var material = new THREE.MeshBasicMaterial( {color: 0xf7f4ef} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.set(0,0.5,5.5);
    cylinder.rotation.x = 1.8;
    scene.add( cylinder );

    // body
    var geometry = new THREE.CylinderGeometry( 1, 0.8, 6, 5 );
    var material = new THREE.MeshBasicMaterial( {color: 0x2d251a} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.set(0,-0.5,2);
    cylinder.rotation.x = 1.4;
    cylinder.name = "body";
    scene.add( cylinder );


    // set camera position
    camera.position.set(0, 10, 10);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // scene.add(lambertCube);
    scene.add(directionalLight);

    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });

    gui.add(settings, 'speed', 0.0, 0.01);

    gui.addColor(settings, 'primaryColor');
    gui.addColor(settings, 'secondaryColor');
    gui.addColor(settings, 'tertiaryColor');

    gui.add(settings, 'elbowX',0, 10).onChange(function(newVal) {
        var elbow = framework.scene.getObjectByName("elbow");
        if (elbow !== undefined) {
            elbow.position.set(newVal, elbow.position.y, elbow.position.z);
        }
    });

    gui.add(settings, 'elbowZ',0, 10).onChange(function(newVal) {
        var elbow = framework.scene.getObjectByName("elbow");
        if (elbow !== undefined) {
            elbow.position.set(elbow.position.x, elbow.position.y, newVal);
        }
    });

    gui.add(settings, 'wristX',0, 10).onChange(function(newVal) {
        var wrist = framework.scene.getObjectByName("wrist");
        if (wrist !== undefined) {
            wrist.position.set(newVal, wrist.position.y, wrist.position.z);
        }
    });

    gui.add(settings, 'wristZ',0, 10).onChange(function(newVal) {
        var wrist = framework.scene.getObjectByName("wrist");
        if (wrist !== undefined) {
            elbow.position.set(wrist.position.x, wrist.position.y, newVal);
        }
    });

    gui.add(settings, 'density', 0, settings.maxDensity);

    gui.add(settings, 'showCtrlPts').onChange(function(newVal) {
        var shoulder = framework.scene.getObjectByName("shoulder");
        var elbow = framework.scene.getObjectByName("elbow");
        if (elbow !== undefined) {
            if (newVal) {
                var geometry = new THREE.BoxGeometry(1,1,1);
            } else {
                var geometry = new THREE.BoxGeometry(0,0,0);
            }
            elbow.geometry = geometry;
        }

        var wrist = framework.scene.getObjectByName("wrist");
        if (wrist !== undefined) {
            if (newVal) {
                var geometry = new THREE.BoxGeometry(1,1,1);
            } else {
                var geometry = new THREE.BoxGeometry(0,0,0);
            }
            wrist.geometry = geometry;
        }
    });

    startTime = (new Date).getTime();
}

// called on frame updates
function onUpdate(framework) {

    var primaryColor = new THREE.Color(settings.primaryColor[0]/255, settings.primaryColor[1]/255, settings.primaryColor[2]/255);
    var secondaryColor = new THREE.Color(settings.secondaryColor[0]/255, settings.secondaryColor[1]/255, settings.secondaryColor[2]/255);
    var tertiaryColor = new THREE.Color(settings.tertiaryColor[0]/255, settings.tertiaryColor[1]/255, settings.tertiaryColor[2]/255);
    var lambertPrimary = new THREE.MeshLambertMaterial({ color: primaryColor, side: THREE.DoubleSide });
    var lambertSecondary = new THREE.MeshLambertMaterial({ color: secondaryColor, side: THREE.DoubleSide });
    var lambertTertiary = new THREE.MeshLambertMaterial({ color: tertiaryColor, side: THREE.DoubleSide });

    var v = new THREE.Vector3(0,0,0);

    // increment the state every timeDelta milliseconds
    // and set the lerp alpha to equal the percentage of time elapsed between state changes
    var elapsed = ((new Date).getTime() - startTime);
    var alpha = elapsed / timeDelta; // amount to lerp
    if (elapsed > timeDelta) {
        alpha = 0;
        startTime = (new Date).getTime();
        state = (state + 1) % 14;
    } else {
        return;a
    }

    var curTime = (new Date).getTime() * settings.speed;
    var freq = settings.speed;

    var shoulder = framework.scene.getObjectByName("shoulder");
    var elbow = framework.scene.getObjectByName("elbow");
    if (elbow !== undefined) {
        elbow.position.set(elbow.position.x, 3 * Math.sin(curTime+1 + 0.5 * Math.sin(curTime+1)), elbow.position.z);
    }

    var wrist = framework.scene.getObjectByName("wrist");
    if (wrist !== undefined) {
        wrist.position.set(wrist.position.x, 6 * Math.sin(curTime + 0.5 * Math.sin(curTime)), wrist.position.z);
    }

    for (var s = 0; s < sections.length; s++) {
        var config = sections[s];
        for (var l = 0; l < settings.numLayers; l++) {
            for (var i = 0; i < settings.maxDensity; i++) {
                var fi = 10 * i / settings.density;
                var name = featherConfig.getName(config.segment, config.region, i, l);
                var feather = framework.scene.getObjectByName(name);
                if (feather !== undefined) {

                    if (i < settings.density) {
                        if (config.segment == "se") {
                            var start = shoulder;
                            var end = elbow;
                        } else if (config.segment == "ew") {
                            var start = elbow;
                            var end = wrist;
                        }

                        var newPos = v.lerpVectors(start.position, end.position, (fi+1)/10);
                        var direction = newPos.y - feather.position.y;
                        feather.position.set(newPos.x, newPos.y+config.yindex, newPos.z+config.zindex);
                        feather.rotation.z = clamp(-direction, -1, 1);
                        feather.rotation.x = 0.3 * Math.random();
                        feather.visible = true;

                        switch (config.color) {
                            case 1:
                            feather.material = lambertPrimary;
                            break;
                            case 2:
                            feather.material = lambertSecondary;
                            break;
                            case 3:
                            feather.material = lambertTertiary;
                            break;
                        }
                    } else {
                        feather.visible = false;
                    }
                } else {
                    console.log("undefined feather: " + name);
                }
            }
        }
    }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
