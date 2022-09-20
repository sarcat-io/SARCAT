echo "$(pwd)" >  __SARCAT_ARCHIVE/.sarcat/.local_pwd
tar -xzvf commonData/cve_data/cve.json.tar.gz commonData/cve_data/
docker run -it --mount type=bind,source=/Users/brianthompson/Code/SARCAT/SARCAT/__SARCAT_ARCHIVE,target=/sarcat_system/__SARCAT_ARCHIVE sarcat:1663708301 node start.mjs /Users/brianthompson/Code/SARCAT/SARCAT __SARCAT_ARCHIVE/sarcat_1663708301.tar 
