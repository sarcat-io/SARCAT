# rm !SARCAT_ARCHIVE!/bundleRegistry.sarcat.json
# rm !SARCAT_ARCHIVE!/rawScanFileRegistry.sarcat.json
# rm !SARCAT_ARCHIVE!/config.sarcat.json
# rm -rf !SARCAT_ARCHIVE!/bundles
# mkdir !SARCAT_ARCHIVE!/bundles
# rm -rf !SARCAT_ARCHIVE!/bundles/SARCAT_bundle_0001/02_assessment-data/02-02_intermediate-objects
echo "$(pwd)" >  !SARCAT_ARCHIVE!/.sarcat/.local_pwd
docker run -it --mount type=bind,source=/Users/brianthompson/Code/SARCAT/SARCAT/!SARCAT_ARCHIVE!,target=/sarcat_system/!SARCAT_ARCHIVE! sarcat:1663049155 node start.mjs /Users/brianthompson/Code/SARCAT/SARCAT !SARCAT_ARCHIVE!/sarcat_1663049155.tar sha256:0d617cff111a3f35918eb9e458e2579a8ecd4160bd64b2835ac99931ca89ec22
