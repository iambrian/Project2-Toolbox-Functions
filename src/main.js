
// Skybox texture from: https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/skybox

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'


// 14 step motion: http://www.brendanbody.co.uk/flight_tutorial/
var state = 0; // 14 states total: 0-8 down, 8-13 up
var motion = {
    states: [
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,3,5),    wrist: new THREE.Vector3(7,7,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,2,5),    wrist: new THREE.Vector3(7,5,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,1,5),    wrist: new THREE.Vector3(7,4,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,0.5,5),  wrist: new THREE.Vector3(7,2,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,0,5),    wrist: new THREE.Vector3(7,1,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,-0.5,5), wrist: new THREE.Vector3(7,0.5,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,-1,5),   wrist: new THREE.Vector3(7,0,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,-2,5),   wrist: new THREE.Vector3(7,-1,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,-3,5),   wrist: new THREE.Vector3(7,-3,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,-3,5),   wrist: new THREE.Vector3(7,-4,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,-1,5),   wrist: new THREE.Vector3(7,-2,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,0.5,5),  wrist: new THREE.Vector3(7,-1,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,2,5),    wrist: new THREE.Vector3(7,2,5)},
        {shoulder: new THREE.Vector3(0,0,5), elbow: new THREE.Vector3(3,3,5),    wrist: new THREE.Vector3(7,4,5)},
    ]
};

var timeDelta = 100; // ms
var startTime;


var settings = {
    speed: 0.003,
    primaryColor: [ 91,	78,	60 ],
    secondaryColor: [ 76, 64, 47 ],
    tertiaryColor: [ 45, 37, 26 ]
}

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
    var primaryColor = new THREE.Color(settings.primaryColor[0]/255, settings.primaryColor[1]/255, settings.primaryColor[2]/255);
    var secondaryColor = new THREE.Color(settings.secondaryColor[0]/255, settings.secondaryColor[1]/255, settings.secondaryColor[2]/255);
    var tertiaryColor = new THREE.Color(settings.tertiaryColor[0]/255, settings.tertiaryColor[1]/255, settings.tertiaryColor[2]/255);
    var lambertPrimary = new THREE.MeshLambertMaterial({ color: primaryColor, side: THREE.DoubleSide });
    var lambertSecondary = new THREE.MeshLambertMaterial({ color: secondaryColor, side: THREE.DoubleSide });
    var lambertTertiary = new THREE.MeshLambertMaterial({ color: tertiaryColor, side: THREE.DoubleSide });


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

        // LOOK: This function runs after the obj has finished loading
        var featherGeo = obj.children[0].geometry;




        for (var i = 0; i < 10; i++) {
            var featherMesh = new THREE.Mesh(featherGeo, lambertPrimary);
            featherMesh.name = "sefeather"+i;
            featherMesh.rotation.y = 1.8;
            featherMesh.scale.set(0.5 + (Math.random() - 0.5)/3,1,1);
            scene.add(featherMesh);
        }

        for (var i = 0; i < 10; i++) {
            var featherMesh = new THREE.Mesh(featherGeo, lambertSecondary);
            featherMesh.name = "sefeather"+i+"-2";
            featherMesh.rotation.y = 1.6;
            featherMesh.scale.set(1 + (Math.random() - 0.5)/2,1,1);
            scene.add(featherMesh);
        }

        for (var i = 0; i < 10; i++) {
            var featherMesh = new THREE.Mesh(featherGeo, lambertTertiary);
            featherMesh.name = "sefeather"+i+"-3";
            featherMesh.rotation.y = 1.6;
            featherMesh.scale.set(1.5 + (Math.random() - 0.5)/2,1,1);
            scene.add(featherMesh);
        }

        for (var i = 0; i < 10; i++) {
            var featherMesh = new THREE.Mesh(featherGeo, lambertPrimary);
            featherMesh.name = "ewfeather"+i;
            featherMesh.rotation.y = 1.6;
            featherMesh.scale.set((10 - i)/20 + (Math.random() - 0.5)/3,1,1);
            scene.add(featherMesh);
        }

        for (var i = 0; i < 10; i++) {
            var featherMesh = new THREE.Mesh(featherGeo, lambertSecondary);
            featherMesh.name = "ewfeather"+i+"-2";
            featherMesh.rotation.y = 1.6/(1+Math.exp(i-7));
            featherMesh.scale.set(1 + (Math.random() - 0.5)/2,1,1);
            scene.add(featherMesh);
        }

        for (var i = 0; i < 10; i++) {
            var featherMesh = new THREE.Mesh(featherGeo, lambertTertiary);
            featherMesh.name = "ewfeather"+i+"-3";
            featherMesh.rotation.y = 1.6/(1+Math.exp(i-7));
            featherMesh.scale.set(1.5 + (Math.random() - 0.5)/2,1,1);
            scene.add(featherMesh);
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

    var feather = framework.scene.getObjectByName("feather");
    if (feather !== undefined) {
        // Simply flap wing
        var date = new Date();
        feather.rotateZ(Math.sin(date.getTime() / 100) * 2 * Math.PI / 180);
    }

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
        return;
    }

    var curTime = (new Date).getTime() * settings.speed;


    var start = state;
    var end = (state + 1) % 14;

    var freq = settings.speed;


    var shoulder = framework.scene.getObjectByName("shoulder");
    if (shoulder !== undefined) {
        var newPos = v.lerpVectors(motion.states[start].shoulder, motion.states[end].shoulder, alpha);
        shoulder.position.set(newPos.x, newPos.y, newPos.z);
    }

    var elbow = framework.scene.getObjectByName("elbow");
    if (elbow !== undefined) {
        // var newPos = v.lerpVectors(motion.states[start].elbow, motion.states[end].elbow, alpha);
        // elbow.position.set(newPos.x, newPos.y, newPos.z);
        elbow.position.set(elbow.position.x, 3 * Math.sin(curTime+1 + 0.5 * Math.sin(curTime+1)), elbow.position.z);
    }

    var wrist = framework.scene.getObjectByName("wrist");
    if (wrist !== undefined) {
        // var newPos = v.lerpVectors(motion.states[start].wrist, motion.states[end].wrist, alpha);
        // wrist.position.set(newPos.x, newPos.y, newPos.z);
        wrist.position.set(wrist.position.x, 6 * Math.sin(curTime + 0.5 * Math.sin(curTime)), wrist.position.z);
    }

    for (var i = 0; i < 10; i++) {
        var sefeather = framework.scene.getObjectByName("sefeather"+i);
        if (sefeather !== undefined) {
            // Simply flap wing
            var newPos = v.lerpVectors(shoulder.position, elbow.position, (i+1)/10);
            var direction = newPos.y - sefeather.position.y;
            sefeather.position.set(newPos.x, newPos.y, newPos.z);
            sefeather.rotation.z = clamp(-direction, -1, 1);
            sefeather.material = lambertPrimary;

            // body motion
            var body = framework.scene.getObjectByName("body");
            if (body !== undefined) {
                newPos = body.position;
                body.position.set(newPos.x, newPos.y - 0.005 * direction, newPos.z);
            }
        }
    }

    for (var i = 0; i < 10; i++) {
        var sefeather = framework.scene.getObjectByName("sefeather"+i+"-2");
        if (sefeather !== undefined) {
            // Simply flap wing
            var newPos = v.lerpVectors(shoulder.position, elbow.position, (i+1)/10);
            var direction = newPos.y - sefeather.position.y;
            sefeather.position.set(newPos.x, newPos.y-0.05, newPos.z-0.5);
            sefeather.rotation.z = clamp(-direction, -1, 1);
            sefeather.material = lambertSecondary;
        }
    }

    for (var i = 0; i < 10; i++) {
        var sefeather = framework.scene.getObjectByName("sefeather"+i+"-3");
        if (sefeather !== undefined) {
            // Simply flap wing
            var newPos = v.lerpVectors(shoulder.position, elbow.position, (i+1)/10);
            var direction = newPos.y - sefeather.position.y;
            sefeather.position.set(newPos.x, newPos.y-0.1, newPos.z-1.5);
            sefeather.rotation.z = clamp(-direction, -1, 1);
            sefeather.material = lambertTertiary;
        }
    }


    for (var i = 0; i < 10; i++) {
        var ewfeather = framework.scene.getObjectByName("ewfeather"+i);
        if (ewfeather !== undefined) {
            // Simply flap wing
            var newPos = v.lerpVectors(elbow.position, wrist.position, (i+1)/10);
            var direction = newPos.y - ewfeather.position.y;
            ewfeather.position.set(newPos.x, newPos.y, newPos.z);
            ewfeather.rotation.z = clamp(-direction, -1, 1);
            ewfeather.material = lambertPrimary;
        }
    }

    for (var i = 0; i < 10; i++) {
        var ewfeather = framework.scene.getObjectByName("ewfeather"+i+"-2");
        if (ewfeather !== undefined) {
            // Simply flap wing
            var newPos = v.lerpVectors(elbow.position, wrist.position, (i+1)/10);
            var direction = newPos.y - ewfeather.position.y;
            ewfeather.position.set(newPos.x, newPos.y-0.05, newPos.z-0.5);
            ewfeather.rotation.z = clamp(-direction, -1, 1);
            ewfeather.material = lambertSecondary;
        }
    }

    for (var i = 0; i < 10; i++) {
        var ewfeather = framework.scene.getObjectByName("ewfeather"+i+"-3");
        if (ewfeather !== undefined) {
            // Simply flap wing
            var newPos = v.lerpVectors(elbow.position, wrist.position, (i+1)/10);
            var direction = newPos.y - ewfeather.position.y;
            ewfeather.position.set(newPos.x, newPos.y-0.1, newPos.z-1.5);
            ewfeather.rotation.z = clamp(-direction, -1, 1);
            ewfeather.material = lambertTertiary;
        }
    }

}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
