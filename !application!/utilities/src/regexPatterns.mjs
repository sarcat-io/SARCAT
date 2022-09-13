export default regularExpressions = {
    "IPv4": RegExp(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}↵(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/gi),
    "fqdn_1": RegExp(/(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}$)/gi),
    "fqdn_2": RegExp(/(?=^.{1,254}$)(^(?:(?!\d+\.)[a-zA-Z0-9_\-]{1,63}\.?)+(?:[a-zA-Z]{1,})$)/gi),
    "email": RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi),
    "url_1": RegExp(/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi),
    "url_2": RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi),
    "url_3": RegExp(/((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/gi),
    "IPv6": RegExp(/(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi),
    "fileWithPath": RegExp(/((\/|\\|\/\/|https?:\\\\|https?:\/\/)[a-z0-9 _@\-^!#$%&+={}.\/\\\[\]]+)+\.[a-z]+$/gi),
    "MAC": RegExp(/(?:[0-9a-fA-F]{2}\:){5}[0-9a-fA-F]{2}/gi),
    "CVE": RegExp(/CVE-\d{4}-\d{4,9}/gi),
    "MD5": RegExp(/^[a-fA-F0-9]{32}$/gi),
    "SHA1": RegExp(/^[a-fA-F0-9]{40}$/gi),
    "SHA256": RegExp(/^[a-fA-F0-9]{64}$/gi),
    "UUID": RegExp(/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi),
    "html_url": RegExp(/<\s*a(\s+.*?>|>).*?<\s*\s*a\s*>/),
    "k8": RegExp(/k8s.*\n/gi),
    "sha": RegExp(/sha:.*\s|\n/gi)
}


/**
 * ip-10-169-115-101.uat.company.com
 * sys0-artifactrepo1-0-env.data.company.com/dva/opencensus-service@sha256'
 * 'gcr.io/google_containers/pause-amd64' 
 * '/var/run/dhclient-eth0.pid' 
 * pem
 * [ 'abrt-addon-xorg-2.1.11-60.el7.centos' // <- centos
 *   '/opt/tools/Linux/jdk/openjdk1.8.0_181_x64/bin/java -Dlogback.configurationFile=/usr/lib/report-collector/logback-docker.xml -Dvertx.cacheDirBase=/var/cache/report-collector -Dvertx.logger-delegate-factory-class-name=io.vertx.core.logging.SLF4JLogDelegateFactory -Dvertx.metrics.options.enabled=true -Dvertx.metrics.options.registryName=vertx-registry -Dvertx.metrics.options.configPath=metric-options.json -Dvertx.disableDnsResolver=true -Dlog_dir=/var/log/report-collector -Dinstance=report-collector-6f757665b6-k88gf -jar /usr/lib/report-collector/report-collector.jar'
 * & java, jar "=/rootdir"
 */