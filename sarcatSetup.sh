# git pull
    mkdir "../.tmp_dockerArchive"
if [ ! -d "!SARCAT_ARCHIVE!" ]; then
    echo "!SARCAT_ARCHIVE! does not exist."
    echo "Creating !SARCAT_ARCHIVE!"
    mkdir "!SARCAT_ARCHIVE!"
    mkdir "!SARCAT_ARCHIVE!/.sarcat"
    touch "!SARCAT_ARCHIVE!/.sarcat/.local_pwd"
    mkdir "!SARCAT_ARCHIVE!/.sarcat/dockerImages"
    mkdir "!SARCAT_ARCHIVE!/rawScanFiles"
fi
cwd=$(pwd)
ts=$(date +%s)
gzCount=$(ls -1 !SARCAT_ARCHIVE!/.sarcat/dockerImages/*.gz 2>/dev/null | wc -l)
if [ $gzCount != 0 ]; then
    echo "Moving prior docker image archives to ../.tmp_dockerArchive"
    mv $cwd/!SARCAT_ARCHIVE!/.sarcat/dockerImages/*.gz $cwd/../.tmp_dockerArchive/
fi

echo "Beginning SARCAT docker image build"
imageHash=$(docker build -q --no-cache -t sarcat:$ts .)
echo "Image created => $imageHash => sarcat:$ts"
echo "Archiving SARCAT image @ $cwd/!SARCAT_ARCHIVE!/.sarcat/dockerImages/sarcat_$ts.tar.gz"
docker save sarcat:$ts | gzip > $cwd/!SARCAT_ARCHIVE!/.sarcat/dockerImages/sarcat_$ts.tar.gz
gzCount2=$(ls -1 $cwd/../.tmp_dockerArchive/*.gz 2>/dev/null | wc -l)
if [ $gzCount2 != 0 ]; then
  echo "Moving docker image archives back"
  mv $cwd/../.tmp_dockerArchive/*.gz $cwd/!SARCAT_ARCHIVE!/.sarcat/dockerImages/
fi
rm -rf $cwd/../.tmp_dockerArchive
sed -i '' '$d' run.sh
fstat=$(ls -lh $cwd/\!SARCAT_ARCHIVE\!/.sarcat/dockerImages/sarcat_$ts.tar.gz | awk {'print $5'})
echo "Image size: $fstat"
echo "docker run -it --mount type=bind,source=$cwd/!SARCAT_ARCHIVE!,target=/sarcat_system/!SARCAT_ARCHIVE! sarcat:$ts node start.mjs $cwd !SARCAT_ARCHIVE!/sarcat_$ts.tar $imageHash" >> run.sh
echo ""
echo "If you are adding raw scan files to a bundle, you may copy them now to:"
echo "   $cwd/!SARCAT_ARCHIVE!/rawScanFiles"
echo ""
echo "Run this script to start SARCAT: ./run.sh"
echo ""
# //ver
# //cat /proc/cpuinfo
# //sysctl -a | grep machdep.cpu | awk -F':' '{ print $2 }'
# uname -a