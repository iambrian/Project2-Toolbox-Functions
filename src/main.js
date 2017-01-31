// Skybox texture from: https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/skybox
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'


// 14 step motion: http://www.brendanbody.co.uk/flight_tutorial/
var state = 0;
var timeDelta = 100; // ms
var startTime;

var settings = {
    speed: 0.003,
    primaryColor: [91, 78, 60],
    secondaryColor: [76, 64, 47],
    tertiaryColor: [45, 37, 26],
    elbowX: 3,
    elbowZ: 5,
    wristX: 7,
    wristZ: 5,
    numLayers: 1,
    maxDensity: 40,
    density: 40,
    windSpeed: 0.3,
    windDirection: 0.0,
    showCtrlPts: false,
    toggleSpline: true
}

var featherConfig = {
    getName: function(segment, region, side, i, l) {
        return "feather(" + segment + "," + region + "," + side + "," + i + "," + l + ")";
    },
    marginalCoverts: {
        segment: "se",
        region: "marginalCoverts",
        yaw: function(i) {
            return Math.PI / 2;
        },
        scale: function(i) {
            return [0.5 + (Math.random() - 0.5) / 3, 1, 1];
        },
        color: 1,
        yindex: 0,
        zindex: 0
    },
    secondaryCoverts: {
        segment: "se",
        region: "secondaryCoverts",
        yaw: function(i) {
            return Math.PI / 2;
        },
        scale: function(i) {
            return [1 + (Math.random() - 0.5) / 2, 1, 1];
        },
        color: 2,
        yindex: -0.05,
        zindex: -0.5
    },
    secondaries: {
        segment: "se",
        region: "secondaries",
        yaw: function(i) {
            return Math.PI / 2;
        },
        scale: function(i) {
            return [1.5 + (Math.random() - 0.5) / 2, 1, 1];
        },
        color: 3,
        yindex: -0.1,
        zindex: -1
    },
    alula: {
        segment: "ew",
        region: "alula",
        yaw: function(i) {
            return Math.PI / 2;
        },
        scale: function(i) {
            return [(10 - i) / 20 + (Math.random() - 0.5) / 3, 1, 1];
        },
        color: 1,
        yindex: 0,
        zindex: 0
    },
    primaryCoverts: {
        segment: "ew",
        region: "primaryCoverts",
        yaw: function(i, side) {
            if (side == "left") {
                var coeff = Math.PI / 2;
                var offset = 0;
            } else {
                var coeff = -Math.PI / 2;
                var offset = Math.PI;
            }
            return coeff / (1 + Math.exp(i - 7)) + offset;
        },
        scale: function(i) {
            return [1 + (Math.random() - 0.5) / 2, 1, 1];
        },
        color: 2,
        yindex: -0.05,
        zindex: -0.5
    },
    primaries: {
        segment: "ew",
        region: "primaries",
        yaw: function(i, side) {
            if (side == "left") {
                var coeff = Math.PI / 2;
                var offset = 0;
            } else {
                var coeff = -Math.PI / 2;
                var offset = Math.PI;
            }
            return coeff / (1 + Math.exp(i - 7)) + offset;
        },
        scale: function(i) {
            return [1.5 + (Math.random() - 0.5) / 2, 1, 1];
        },
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
    featherConfig.primaries
];

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
    var lambertWhite = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    });

    // Set light
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    // set skybox
    var loader = new THREE.CubeTextureLoader();
    var urlPrefix = 'images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ]);

    scene.background = skymap;

    // load a simple obj mesh
    var objLoader = new THREE.OBJLoader();
    objLoader.load('geo/feather.obj', function(obj) {
        var featherGeo = obj.children[0].geometry;

        ["left", "right"].forEach(function(value, index, array) {
            var side = value;
            for (var s = 0; s < sections.length; s++) {
                var config = sections[s];
                for (var l = 0; l < settings.numLayers; l++) {
                    for (var i = 0; i < settings.density; i++) {
                        var fi = 10 * i / settings.density;
                        var featherMesh = new THREE.Mesh(featherGeo, lambertWhite);
                        featherMesh.name = featherConfig.getName(config.segment, config.region, side, i, l);
                        featherMesh.rotation.y = config.yaw(fi, side);
                        var scale = config.scale(fi);
                        featherMesh.scale.set(scale[0], scale[1], scale[2]);
                        scene.add(featherMesh);
                    }
                }
            }
        });

        // tail
        for (var i = 5; i < 15; i++) {
            var featherMesh = new THREE.Mesh(featherGeo, lambertWhite);
            var fi = 10 * i / 20;
            featherMesh.name = featherConfig.getName("tail", "tail", "center", i, 0);
            featherMesh.rotation.y = 3 * fi / 10;
            featherMesh.position.set(0, -0.25, 0);
            featherMesh.scale.set(1, 1, 1);
            scene.add(featherMesh);
        }
    });

    var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    var material = new THREE.MeshBasicMaterial({
        color: 0xCB2400
    });
    var shoulder = new THREE.Mesh(geometry, material);
    shoulder.position.set(0, 0, 5);
    shoulder.name = "shoulder";
    shoulder.visible = settings.showCtrlPts;
    scene.add(shoulder);

    var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    var material = new THREE.MeshBasicMaterial({
        color: 0xC67563
    });
    var elbow = new THREE.Mesh(geometry, material);
    elbow.position.set(3, -3, 5);
    elbow.name = "elbow";
    elbow.visible = settings.showCtrlPts;
    scene.add(elbow);


    var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    var material = new THREE.MeshBasicMaterial({
        color: 0xCAA8A1
    });
    var wrist = new THREE.Mesh(geometry, material);
    wrist.position.set(7, -7, 5);
    wrist.name = "wrist";
    wrist.visible = settings.showCtrlPts;
    scene.add(wrist);

    // spline
    var curve = new THREE.SplineCurve3( [
    	shoulder.position,
        elbow.position,
        wrist.position
    ] );
    var path = new THREE.Path( curve.getPoints( 50 ) );
    var geometry = path.createPointsGeometry( 50 );
    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

    // Create the final object to add to the scene
    var splineObject = new THREE.Line( geometry, material );
    splineObject.name = "spline";
    splineObject.visible = settings.showCtrlPts;
    scene.add(splineObject);

    // beak
    var geometry = new THREE.CylinderGeometry(0.01, 0.5, 2, 5);
    var material = new THREE.MeshBasicMaterial({
        color: 0xffff00
    });
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0, 0, 6);
    cylinder.rotation.x = 2;
    scene.add(cylinder);

    // head
    var geometry = new THREE.CylinderGeometry(0.7, 0.8, 1, 5);
    var material = new THREE.MeshBasicMaterial({
        color: 0xf7f4ef
    });
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0, 0.5, 5.5);
    cylinder.rotation.x = 1.8;
    scene.add(cylinder);

    // body
    var geometry = new THREE.CylinderGeometry(1.2, 0.8, 6, 5);
    var material = new THREE.MeshBasicMaterial({
        color: 0x2d251a
    });
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0, -0.5, 2);
    cylinder.rotation.x = 1.4;
    cylinder.name = "body";
    scene.add(cylinder);


    // set camera position
    camera.position.set(0, 10, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

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

    gui.add(settings, 'elbowX', 0, 10).onChange(function(newVal) {
        var elbow = framework.scene.getObjectByName("elbow");
        if (elbow !== undefined) {
            elbow.position.set(newVal, elbow.position.y, elbow.position.z);
        }
    });

    gui.add(settings, 'elbowZ', 0, 10).onChange(function(newVal) {
        var elbow = framework.scene.getObjectByName("elbow");
        if (elbow !== undefined) {
            elbow.position.set(elbow.position.x, elbow.position.y, newVal);
        }
    });

    gui.add(settings, 'wristX', 0, 10).onChange(function(newVal) {
        var wrist = framework.scene.getObjectByName("wrist");
        if (wrist !== undefined) {
            wrist.position.set(newVal, wrist.position.y, wrist.position.z);
        }
    });

    gui.add(settings, 'wristZ', 0, 10).onChange(function(newVal) {
        var wrist = framework.scene.getObjectByName("wrist");
        if (wrist !== undefined) {
            elbow.position.set(wrist.position.x, wrist.position.y, newVal);
        }
    });

    gui.add(settings, 'density', 0, settings.maxDensity);

    gui.add(settings, 'showCtrlPts').onChange(function(newVal) {
        var shoulder = framework.scene.getObjectByName("shoulder");
        if (shoulder !== undefined) {
            shoulder.visible = newVal;
        }

        var elbow = framework.scene.getObjectByName("elbow");
        if (elbow !== undefined) {
            elbow.visible = newVal;
        }

        var wrist = framework.scene.getObjectByName("wrist");
        if (wrist !== undefined) {
            wrist.visible = newVal;
        }

        var spline = framework.scene.getObjectByName("spline");
        if (spline !== undefined) {
            spline.visible = newVal;
        }

    });

    gui.add(settings, 'windSpeed', 0.0, 1.0);
    gui.add(settings, 'windDirection', -1.0, 1.0);

    gui.add(settings, 'toggleSpline');

    startTime = (new Date).getTime();
}

// called on frame updates
function onUpdate(framework) {

    var primaryColor = new THREE.Color(settings.primaryColor[0] / 255, settings.primaryColor[1] / 255, settings.primaryColor[2] / 255);
    var secondaryColor = new THREE.Color(settings.secondaryColor[0] / 255, settings.secondaryColor[1] / 255, settings.secondaryColor[2] / 255);
    var tertiaryColor = new THREE.Color(settings.tertiaryColor[0] / 255, settings.tertiaryColor[1] / 255, settings.tertiaryColor[2] / 255);
    var lambertPrimary = new THREE.MeshLambertMaterial({
        color: primaryColor,
        side: THREE.DoubleSide
    });
    var lambertSecondary = new THREE.MeshLambertMaterial({
        color: secondaryColor,
        side: THREE.DoubleSide
    });
    var lambertTertiary = new THREE.MeshLambertMaterial({
        color: tertiaryColor,
        side: THREE.DoubleSide
    });

    var v = new THREE.Vector3(0, 0, 0);

    // increment the state every timeDelta milliseconds
    // and set the lerp alpha to equal the percentage of time elapsed between state changes
    var elapsed = ((new Date).getTime() - startTime);
    var alpha = elapsed / timeDelta; // amount to lerp
    if (elapsed > timeDelta) {
        alpha = 0;
        startTime = (new Date).getTime();
        state = (state + 1) % 14;
    } else {
        return;
    }

    var curTime = (new Date).getTime() * settings.speed;
    var freq = settings.speed;

    // joints
    var shoulder = framework.scene.getObjectByName("shoulder");
    var elbow = framework.scene.getObjectByName("elbow");
    if (elbow !== undefined) {
        var newY =  3 * Math.sin(curTime + 1 + 0.5 * Math.sin(curTime + 1));
        var delta = 0.05 * (newY - elbow.position.y);
        elbow.position.set(elbow.position.x, newY, elbow.position.z);
        var body = framework.scene.getObjectByName("body");
        if (body !== undefined) {
            body.position.set(body.position.x, body.position.y - delta, body.position.z);
        }

        // tail
        for (var i = 5; i < 15; i++) {
            var fi = 10 * i / 20;
            var name = featherConfig.getName("tail", "tail", "center", i, 0);
            var feather = framework.scene.getObjectByName(name);
            if (feather !== undefined) {
                feather.rotation.x = settings.windSpeed * 0.1 * Math.random();
                feather.position.set(feather.position.x, feather.position.y - delta, feather.position.z);
            }
        }
    }

    var wrist = framework.scene.getObjectByName("wrist");
    if (wrist !== undefined) {
        wrist.position.set(wrist.position.x, 6 * Math.sin(curTime + 0.5 * Math.sin(curTime)), wrist.position.z);
    }

    // spline

    // Create the final object to add to the scene
    var splineObject = framework.scene.getObjectByName("spline");
    if (splineObject !== undefined) {
        var curve = new THREE.SplineCurve3( [
        	shoulder.position,
            elbow.position,
            wrist.position
        ] );
        var path = new THREE.Path( curve.getPoints( 50 ) );
        var geometry = path.createPointsGeometry( 50 );
        splineObject.geometry = geometry;
        splineObject.position.set(shoulder.position.x, shoulder.position.y, shoulder.position.z);
    }


    // feathers
    ["left", "right"].forEach(function(value, index, array) {
        var side = value;
        for (var s = 0; s < sections.length; s++) {
            var config = sections[s];
            for (var l = 0; l < settings.numLayers; l++) {
                for (var i = 0; i < settings.maxDensity; i++) {
                    var fi = 10 * i / settings.density;
                    var name = featherConfig.getName(config.segment, config.region, side, i, l);
                    var feather = framework.scene.getObjectByName(name);
                    if (feather !== undefined) {

                        if (i < settings.density) {

                            if (config.segment == "se") {
                                var start = shoulder;
                                var end = elbow;
                                var t = fi / 10 * 0.5;
                            } else if (config.segment == "ew") {
                                var start = elbow;
                                var end = wrist;
                                var t = fi / 10 * 0.5 + 0.5;
                            }

                            if (side == "right") {
                                var coeff = -1;
                            } else {
                                var coeff = 1;
                            }

                            if (settings.toggleSpline) {
                                var newPos = curve.getPoint(t);
                            } else {
                                var newPos = v.lerpVectors(start.position, end.position, (fi + 1) / 10);
                            }
                            var direction = newPos.y - feather.position.y;
                            feather.position.set(coeff * newPos.x, newPos.y + config.yindex, newPos.z + config.zindex);
                            feather.rotation.z = clamp(-direction, -1, 1);
                            feather.rotation.x = settings.windSpeed * Math.random();
                            feather.rotation.y = config.yaw(fi, side) - settings.windDirection;
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
    });
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
