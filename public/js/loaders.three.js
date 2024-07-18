// DOES NOT WORK


































































































import { Rhino3dmLoader } from "three/addons/loaders/3DMLoader.js";
import { ThreeMFLoader } from "three/addons/loaders/3MFLoader.js";
import { AMFLoader } from "three/addons/loaders/AMFLoader.js";
import { BVHLoader } from "three/addons/loaders/BVHLoader.js";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import { DDSLoader } from "three/addons/loaders/DDSLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GCodeLoader } from "three/addons/loaders/GCodeLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRCubeTextureLoader } from "three/addons/loaders/HDRCubeTextureLoader.js";
import { IESLoader } from "three/addons/loaders/IESLoader.js";
import { KMZLoader } from "three/addons/loaders/KMZLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { KTXLoader } from "three/addons/loaders/KTXLoader.js";
import { LDrawLoader } from "three/addons/loaders/LDrawLoader.js";
import { LUT3dlLoader } from "three/addons/loaders/LUT3dlLoader.js";
import { LUTCubeLoader } from "three/addons/loaders/LUTCubeLoader.js";
import { LUTImageLoader } from "three/addons/loaders/LUTImageLoader.js";
import { LWOLoader } from "three/addons/loaders/LWOLoader.js";
import { LogLuvLoader } from "three/addons/loaders/LogLuvLoader.js";
import { LottieLoader } from "three/addons/loaders/LottieLoader.js";
import { MD2Loader } from "three/addons/loaders/MD2Loader.js";
import { MDDLoader } from "three/addons/loaders/MDDLoader.js";
import { MMDLoader } from "three/addons/loaders/MMDLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { MaterialXLoader } from "three/addons/loaders/MaterialXLoader.js";
import { NRRDLoader } from "three/addons/loaders/NRRDLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { PCDLoader } from "three/addons/loaders/PCDLoader.js";
import { PDBLoader } from "three/addons/loaders/PDBLoader.js";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { PVRLoader } from "three/addons/loaders/PVRLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RGBMLoader } from "three/addons/loaders/RGBMLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { TDSLoader } from "three/addons/loaders/TDSLoader.js";
import { TGALoader } from "three/addons/loaders/TGALoader.js";
import { TIFFLoader } from "three/addons/loaders/TIFFLoader.js";
import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
import { TiltLoader } from "three/addons/loaders/TiltLoader.js";
import { USDZLoader } from "three/addons/loaders/USDZLoader.js";
import { VOXLoader } from "three/addons/loaders/VOXLoader.js";
import { VRMLLoader } from "three/addons/loaders/VRMLLoader.js";
import { VTKLoader } from "three/addons/loaders/VTKLoader.js";
import { XYZLoader } from "three/addons/loaders/XYZLoader.js";



// Define loading functions for each loader
function createLoaderFunction(Loader, name) {
    return (url, scene) => {
        let loaded = false;
        let running = true;
        const loader = new Loader();

        loader.load(
            url,
            obj => {
                scene.add(obj.scene || obj);
                loaded = true;
                running = false;
            },
            null,
            error => {
                console.warn(`An error happened in ${name}:`, error);
                running = false;
            }
        );

        const checkLoading = () => {
            if (running) return setTimeout(checkLoading, 100);
            if (loaded) return true;
            // throw new Error("Skipping loading of " + name + " because it failed.");
            return false;
        };

        return checkLoading;
    };
}



const loadGLTFModel = createLoaderFunction(GLTFLoader, "GLTFLoader");
const loadOBJModel = createLoaderFunction(OBJLoader, "OBJLoader");
const loadFBXModel = createLoaderFunction(FBXLoader, "FBXLoader");
const loadRhino3dmModel = createLoaderFunction(Rhino3dmLoader, "Rhino3dmLoader");
const loadThreeMFModel = createLoaderFunction(ThreeMFLoader, "ThreeMFLoader");
const loadAMFModel = createLoaderFunction(AMFLoader, "AMFLoader");
const loadBVHModel = createLoaderFunction(BVHLoader, "BVHLoader");
const loadColladaModel = createLoaderFunction(ColladaLoader, "ColladaLoader");
const loadDDSModel = createLoaderFunction(DDSLoader, "DDSLoader");
const loadDRACOModel = createLoaderFunction(DRACOLoader, "DRACOLoader");
const loadEXRModel = createLoaderFunction(EXRLoader, "EXRLoader");
const loadFontModel = createLoaderFunction(FontLoader, "FontLoader");
const loadGCodeModel = createLoaderFunction(GCodeLoader, "GCodeLoader");
const loadHDRCubeTextureModel = createLoaderFunction(HDRCubeTextureLoader, "HDRCubeTextureLoader");
const loadIESModel = createLoaderFunction(IESLoader, "IESLoader");
const loadKMZModel = createLoaderFunction(KMZLoader, "KMZLoader");
const loadKTX2Model = createLoaderFunction(KTX2Loader, "KTX2Loader");
const loadKTXModel = createLoaderFunction(KTXLoader, "KTXLoader");
const loadLDrawModel = createLoaderFunction(LDrawLoader, "LDrawLoader");
const loadLUT3dlModel = createLoaderFunction(LUT3dlLoader, "LUT3dlLoader");
const loadLUTCubeModel = createLoaderFunction(LUTCubeLoader, "LUTCubeLoader");
const loadLUTImageModel = createLoaderFunction(LUTImageLoader, "LUTImageLoader");
const loadLWOModel = createLoaderFunction(LWOLoader, "LWOLoader");
const loadLogLuvModel = createLoaderFunction(LogLuvLoader, "LogLuvLoader");
const loadLottieModel = createLoaderFunction(LottieLoader, "LottieLoader");
const loadMD2Model = createLoaderFunction(MD2Loader, "MD2Loader");
const loadMDDModel = createLoaderFunction(MDDLoader, "MDDLoader");
const loadMMDModel = createLoaderFunction(MMDLoader, "MMDLoader");
const loadMTLModel = createLoaderFunction(MTLLoader, "MTLLoader");
const loadMaterialXModel = createLoaderFunction(MaterialXLoader, "MaterialXLoader");
const loadNRRDModel = createLoaderFunction(NRRDLoader, "NRRDLoader");
const loadPCDModel = createLoaderFunction(PCDLoader, "PCDLoader");
const loadPDBModel = createLoaderFunction(PDBLoader, "PDBLoader");
const loadPLYModel = createLoaderFunction(PLYLoader, "PLYLoader");
const loadPVRModel = createLoaderFunction(PVRLoader, "PVRLoader");
const loadRGBEModel = createLoaderFunction(RGBELoader, "RGBELoader");
const loadRGBMModel = createLoaderFunction(RGBMLoader, "RGBMLoader");
const loadSTLModel = createLoaderFunction(STLLoader, "STLLoader");
const loadSVGModel = createLoaderFunction(SVGLoader, "SVGLoader");
const loadTDSModel = createLoaderFunction(TDSLoader, "TDSLoader");
const loadTGAModel = createLoaderFunction(TGALoader, "TGALoader");
const loadTIFFModel = createLoaderFunction(TIFFLoader, "TIFFLoader");
const loadTTFModel = createLoaderFunction(TTFLoader, "TTFLoader");
const loadTiltModel = createLoaderFunction(TiltLoader, "TiltLoader");
const loadUSDZModel = createLoaderFunction(USDZLoader, "USDZLoader");
const loadVOXModel = createLoaderFunction(VOXLoader, "VOXLoader");
const loadVRMLModel = createLoaderFunction(VRMLLoader, "VRMLLoader");
const loadVTKModel = createLoaderFunction(VTKLoader, "VTKLoader");
const loadXYZModel = createLoaderFunction(XYZLoader, "XYZLoader");



// Export the loaders
export {
    loadGLTFModel,
    loadRhino3dmModel,
    loadThreeMFModel,
    loadAMFModel,
    loadBVHModel,
    loadColladaModel,
    loadDDSModel,
    loadDRACOModel,
    loadEXRModel,
    loadFBXModel,
    loadFontModel,
    loadGCodeModel,
    loadHDRCubeTextureModel,
    loadIESModel,
    loadKMZModel,
    loadKTX2Model,
    loadKTXModel,
    loadLDrawModel,
    loadLUT3dlModel,
    loadLUTCubeModel,
    loadLUTImageModel,
    loadLWOModel,
    loadLogLuvModel,
    loadLottieModel,
    loadMD2Model,
    loadMDDModel,
    loadMMDModel,
    loadMTLModel,
    loadMaterialXModel,
    loadNRRDModel,
    loadOBJModel,
    loadPCDModel,
    loadPDBModel,
    loadPLYModel,
    loadPVRModel,
    loadRGBEModel,
    loadRGBMModel,
    loadSTLModel,
    loadSVGModel,
    loadTDSModel,
    loadTGAModel,
    loadTIFFModel,
    loadTTFModel,
    loadTiltModel,
    loadUSDZModel,
    loadVOXModel,
    loadVRMLModel,
    loadVTKModel,
    loadXYZModel
};

export default {
    loadGLTFModel,
    loadRhino3dmModel,
    loadThreeMFModel,
    loadAMFModel,
    loadBVHModel,
    loadColladaModel,
    loadDDSModel,
    loadDRACOModel,
    loadEXRModel,
    loadFBXModel,
    loadFontModel,
    loadGCodeModel,
    loadHDRCubeTextureModel,
    loadIESModel,
    loadKMZModel,
    loadKTX2Model,
    loadKTXModel,
    loadLDrawModel,
    loadLUT3dlModel,
    loadLUTCubeModel,
    loadLUTImageModel,
    loadLWOModel,
    loadLogLuvModel,
    loadLottieModel,
    loadMD2Model,
    loadMDDModel,
    loadMMDModel,
    loadMTLModel,
    loadMaterialXModel,
    loadNRRDModel,
    loadOBJModel,
    loadPCDModel,
    loadPDBModel,
    loadPLYModel,
    loadPVRModel,
    loadRGBEModel,
    loadRGBMModel,
    loadSTLModel,
    loadSVGModel,
    loadTDSModel,
    loadTGAModel,
    loadTIFFModel,
    loadTTFModel,
    loadTiltModel,
    loadUSDZModel,
    loadVOXModel,
    loadVRMLModel,
    loadVTKModel,
    loadXYZModel
};