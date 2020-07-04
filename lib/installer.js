"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateVersions = exports.getSentinel = void 0;
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const os = __importStar(require("os"));
const semver = __importStar(require("semver"));
const util = __importStar(require("util"));
const httpm = __importStar(require("@actions/http-client"));
const osArch = translateOsArch(os.arch());
const osPlat = translateOsPlatform(os.platform());
function getSentinel(versionSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        let toolPath;
        toolPath = tc.find('sentinel', versionSpec);
        if (!toolPath) {
            const version = yield queryLatestMatch(versionSpec);
            if (!version) {
                throw new Error(`Unable to find Sentinel version '${versionSpec}' for platform ${osPlat} and architecture ${osArch}.`);
            }
            toolPath = yield acquireSentinel(version);
            core.debug(`Sentinel tool is cached under ${toolPath}`);
        }
        core.addPath(toolPath);
    });
}
exports.getSentinel = getSentinel;
function queryLatestMatch(versionSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        const versions = [];
        const http = new httpm.HttpClient('setup-sentinel', [], {
            allowRetries: true,
            maxRetries: 3
        });
        const url = 'https://releases.hashicorp.com/sentinel/index.json';
        const response = yield http.getJson(url);
        const obj = response.result;
        if (obj && obj.versions) {
            for (const version of Object.values(obj.versions)) {
                const supportedBuild = version.builds.find(build => osPlat === build.os && osArch === build.arch);
                if (supportedBuild) {
                    versions.push(supportedBuild.version);
                }
            }
        }
        return evaluateVersions(versions, versionSpec);
    });
}
function acquireSentinel(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const downloadUrl = getDownloadUrl(version);
        let downloadPath = null;
        try {
            downloadPath = yield tc.downloadTool(downloadUrl);
        }
        catch (error) {
            core.debug(error);
            throw new Error(`Failed to download version ${version}: ${error}`);
        }
        const extPath = yield tc.extractZip(downloadPath);
        return yield tc.cacheDir(extPath, 'sentinel', version);
    });
}
function getDownloadUrl(version) {
    return util.format(`https://releases.hashicorp.com/sentinel/%s/sentinel_%s_%s_%s.zip`, version, version, osPlat, osArch);
}
function translateOsArch(arch) {
    switch (arch) {
        case 'x64':
            return 'amd64';
        case 'x32':
            return '386';
        default:
            return arch;
    }
}
function translateOsPlatform(platform) {
    switch (platform) {
        case 'win32':
            return 'windows';
        default:
            return platform;
    }
}
//
// Lifted directly from @actions/tool-cache, assuming
// this will be exported in a future version.
//
function evaluateVersions(versions, versionSpec) {
    let version = '';
    core.debug(`evaluating ${versions.length} versions`);
    versions = versions.sort((a, b) => {
        if (semver.gt(a, b)) {
            return 1;
        }
        return -1;
    });
    for (let i = versions.length - 1; i >= 0; i--) {
        const potential = versions[i];
        const satisfied = semver.satisfies(potential, versionSpec);
        if (satisfied) {
            version = potential;
            break;
        }
    }
    if (version) {
        core.debug(`matched: ${version}`);
    }
    else {
        core.debug('match not found');
    }
    return version;
}
exports.evaluateVersions = evaluateVersions;
