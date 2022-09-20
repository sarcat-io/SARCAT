# git pull
rm -rf "__SARCAT_ARCHIVE"
echo "__SARCAT_ARCHIVE does not exist."
echo "Creating __SARCAT_ARCHIVE"
mkdir "__SARCAT_ARCHIVE"
mkdir "__SARCAT_ARCHIVE/.sarcat"
touch "__SARCAT_ARCHIVE/.sarcat/.local_pwd"
mkdir "__SARCAT_ARCHIVE/.sarcat/dockerImages"
mkdir "__SARCAT_ARCHIVE/rawScanFiles"
cp -R "/Users/brianthompson/Code/SARCAT/.holding/rawScanFiles_copy" "__SARCAT_ARCHIVE/rawScanFiles"
echo "If you are adding raw scan files to a bundle, you may copy them now to:"
echo "   $cwd/__SARCAT_ARCHIVE/rawScanFiles"
echo ""
echo "Run this script to start SARCAT: ./run.sh"
echo ""
# //ver
# //cat /proc/cpuinfo
# //sysctl -a | grep machdep.cpu | awk -F':' '{ print $2 }'
# uname -a