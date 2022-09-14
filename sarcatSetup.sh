# git pull
    mkdir "../.tmp_dockerArchive"
if [ ! -d "__SARCAT_ARCHIVE" ]; then
    echo "__SARCAT_ARCHIVE does not exist."
    echo "Creating __SARCAT_ARCHIVE"
    mkdir "__SARCAT_ARCHIVE"
    mkdir "__SARCAT_ARCHIVE/.sarcat"
    touch "__SARCAT_ARCHIVE/.sarcat/.local_pwd"
    mkdir "__SARCAT_ARCHIVE/.sarcat/dockerImages"
    mkdir "__SARCAT_ARCHIVE/rawScanFiles"
fi
cwd=$(pwd)
ts=$(date +%s)
gzCount=$(ls -1 __SARCAT_ARCHIVE/.sarcat/dockerImages/*.gz 2>/dev/null | wc -l)
if [ $gzCount != 0 ]; then
    echo "Moving prior docker image archives to ../.tmp_dockerArchive"
    mv $cwd/__SARCAT_ARCHIVE/.sarcat/dockerImages/*.gz $cwd/../.tmp_dockerArchive/
fi

echo "Beginning SARCAT docker image build"
imageHash=$(docker build -q --no-cache -t sarcat:$ts .)
echo "Image created => $imageHash => sarcat:$ts"
echo "Archiving SARCAT image @ $cwd/__SARCAT_ARCHIVE/.sarcat/dockerImages/sarcat_$ts.tar.gz"
docker save sarcat:$ts | gzip > $cwd/__SARCAT_ARCHIVE/.sarcat/dockerImages/sarcat_$ts.tar.gz
gzCount2=$(ls -1 $cwd/../.tmp_dockerArchive/*.gz 2>/dev/null | wc -l)
if [ $gzCount2 != 0 ]; then
  echo "Moving docker image archives back"
  mv $cwd/../.tmp_dockerArchive/*.gz $cwd/__SARCAT_ARCHIVE/.sarcat/dockerImages/
fi
rm -rf $cwd/../.tmp_dockerArchive
sed -i '' '$d' run.sh
fstat=$(ls -lh $cwd/\!SARCAT_ARCHIVE\!/.sarcat/dockerImages/sarcat_$ts.tar.gz | awk {'print $5'})
echo "Image size: $fstat"
echo "docker run -it --mount type=bind,source=$cwd/__SARCAT_ARCHIVE,target=/sarcat_system/__SARCAT_ARCHIVE sarcat:$ts node start.mjs $cwd __SARCAT_ARCHIVE/sarcat_$ts.tar $imageHash" >> run.sh
echo ""
echo "If you are adding raw scan files to a bundle, you may copy them now to:"
echo "   $cwd/__SARCAT_ARCHIVE/rawScanFiles"
echo ""
echo "Run this script to start SARCAT: ./run.sh"
echo ""
# //ver
# //cat /proc/cpuinfo
# //sysctl -a | grep machdep.cpu | awk -F':' '{ print $2 }'
# uname -a