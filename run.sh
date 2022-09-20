echo "$(pwd)" >  __SARCAT_ARCHIVE/.sarcat/.local_pwd
cd $(pwd)/commonData/cve_data/
tar -xzvf cve.json.tar.gz
cd -
docker run -it --mount type=bind,source=/Users/brianthompson/Code/SARCAT/SARCAT/__SARCAT_ARCHIVE,target=/sarcat_system/__SARCAT_ARCHIVE sarcat:1663709522 node start.mjs /Users/brianthompson/Code/SARCAT/SARCAT __SARCAT_ARCHIVE/sarcat_1663709522.tar 
