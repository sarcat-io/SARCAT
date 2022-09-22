import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
import {logo, sarcat} from './logo.mjs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
import { _SC } from './sarcat_class.mjs'
const archiveDirectory = normalize(`${__dirname}/../__SARCAT_ARCHIVE`)
import { _SC_utilities } from './utilities/index_utilities.mjs'
const _util = new _SC_utilities()
import {_SC_commonData} from '../commonData/index_commonData.mjs'
const _cd = new _SC_commonData()
import {_SC_templates} from '../templates/index_templates.mjs'
const _tmp = new _SC_templates
import {_SC_crypto} from './utilities/crypto_class.mjs'
const _crypto = new _SC_crypto()
///////////////////////////////////////////////////////////////
const dockerImageHash = process.argv[5]
const dockerImageZip = process.argv[4]
const localWorkingDirectory = process.argv[3]
// console.log(dockerImageHash, dockerImageZip)
///////////////////////////////////////////////////////////////
async function _main_(){
    console.log(logo)
        const _sc = new _SC(archiveDirectory)
        await _sc.populateArchive()
        await _sc.bootstrap()
        await _sc.runSetup_00()
        var workingBundle = await _sc.runBundle_10()
        // console.log(workingBundle.data.fileHashes)
        await _sc.runParse_20(workingBundle)
    // await _util.zipFolder(archiveDirectory)
    

    // console.log(_sc)

    // console.log()
    //prompt for what to do via role name
    // AO -> check for AO keyPairs
    // ISSO
    /**
     * Single Archvive 
     *  CSP: Default: Auto -> Bootstap Setup -> New Bundle -> Add files to bundle -> Parse -> Nomalize -> analyze -> corelate -> assemble.
     *  CSP: Seal -> Internal or AO or 3PAO
     * Multiple Archive
     *  AO: Audit single bundle deliverables, Audit Historical Deliverables, Validate Single Bundle, Validate History, Generate Receipt, Update Baselines, Update Authoization Thresholds / Rules
     * 
     */

    // parse files with status in_bundle update status to parsed and add filepath to parsed objectsd
}
_main_()


async function utilTest(){
    const jsonFile = '/Users/brianthompson/Code/SARCAT/SARCAT/__SARCAT_ARCHIVE/bundles/SARCAT_bundle_0001/02_assessment-data/02-04_poam-objects/d13c42323cb887b290185552f04c407dfa7eed6cf7055c9d669eafbbb1660fda_poam.json'
    // SARCAT/__SARCAT_ARCHIVE/bundles/SARCAT_bundle_0001/02_assessment-data/02-04_poam-objects/de03f74dfaeca90fc8ede81afad21f73bb5458ed7c508bc2e8dfb0966a7e9e7b_poam.json
    // SARCAT/__SARCAT_ARCHIVE/bundles/SARCAT_bundle_0001/02_assessment-data/02-04_poam-objects/0eea8541f3ce073725d125fd49fac793ab8e753c0a748a1e97a33d391d726fdf_poam.json
    // SARCAT/__SARCAT_ARCHIVE/bundles/SARCAT_bundle_0001/02_assessment-data/02-04_poam-objects/d13c42323cb887b290185552f04c407dfa7eed6cf7055c9d669eafbbb1660fda_poam.json
    _util.json2xlsx(jsonFile)

}

// utilTest()