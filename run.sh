echo "$(pwd)" >  __SARCAT_ARCHIVE/.sarcat/.local_pwd
docker run -it --mount type=bind,source=/Users/brianthompson/Code/SARCAT/SARCAT/__SARCAT_ARCHIVE,target=/sarcat_system/__SARCAT_ARCHIVE sarcat:1663369058 node start.mjs /Users/brianthompson/Code/SARCAT/SARCAT __SARCAT_ARCHIVE/sarcat_1663369058.tar sha256:3b62cacb3c7f96d6f59a12b6f9cc389a94cb9b3eeb78e17833a48f71eadc876e
