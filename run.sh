# rm __SARCAT_ARCHIVE/bundleRegistry.sarcat.json
# rm __SARCAT_ARCHIVE/rawScanFileRegistry.sarcat.json
# rm __SARCAT_ARCHIVE/config.sarcat.json
# rm -rf __SARCAT_ARCHIVE/bundles
# mkdir __SARCAT_ARCHIVE/bundles
# rm -rf __SARCAT_ARCHIVE/bundles/SARCAT_bundle_0001/02_assessment-data/02-02_intermediate-objects
echo "$(pwd)" >  __SARCAT_ARCHIVE/.sarcat/.local_pwd
docker run -it --mount type=bind,source=/Users/brianthompson/Code/SARCAT/SARCAT/__SARCAT_ARCHIVE,target=/sarcat_system/__SARCAT_ARCHIVE sarcat:1663308141 node start.mjs /Users/brianthompson/Code/SARCAT/SARCAT __SARCAT_ARCHIVE/sarcat_1663308141.tar 
