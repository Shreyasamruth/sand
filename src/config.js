export const appConfig = {
  fileName: "HDP_2.6.5_virtualbox_180626.ova",
  version: "2.6.5",
  fileSize: "15.01 GB (16,118,895,104 bytes)",
  format: "VirtualBox Open Virtual Appliance (.ova)",
  releaseDate: "June 26, 2018",
  
  // Primary Live Host Stream (Host Machine via Cloudflare Tunnel)
  downloadUrl: "https://people-strange-traveling-improved.trycloudflare.com",

  // Permanent Fail-Safe Storage Mirror (100% Reliable - Zero Error 1033)
  fallbackUrl: "https://drive.google.com/drive/folders/1y0xDrtToGEW8_gs0u1UeLxMWIc69diA7?usp=drive_link",
  
  // Alternate mirror links
  mirrors: [
    {
      name: "Google Drive Cloud Storage (100% Reliable - Zero Error 1033)",
      url: "https://drive.google.com/drive/folders/1y0xDrtToGEW8_gs0u1UeLxMWIc69diA7?usp=drive_link",
      speed: "Permanent Google Cloud Infrastructure (Always Online)"
    },
    {
      name: "Local Network Direct Stream (Host Machine)",
      url: "http://10.101.158.77:8080/download",
      speed: "Direct Local LAN Transfer (Port 8080)"
    }
  ],

  hdpComponents: [
    { name: "Hadoop / HDFS", version: "2.7.3" },
    { name: "Apache Spark", version: "2.3.0" },
    { name: "Apache Hive", version: "1.2.1000" },
    { name: "Apache HBase", version: "1.1.2" },
    { name: "Apache Ambari", version: "2.6.2" },
    { name: "Apache Zeppelin", version: "0.7.3" },
    { name: "Apache Pig", version: "0.16.0" },
    { name: "Apache Sqoop", version: "1.4.6" }
  ],

  defaultCredentials: {
    ambariUrl: "http://127.0.0.1:8080",
    ambariUser: "admin",
    ambariPass: "admin",
    sshHost: "127.0.0.1",
    sshPort: "2222",
    sshUser: "root",
    sshPass: "hadoop"
  }
};
