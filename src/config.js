export const appConfig = {
  fileName: "HDP_2.6.5_virtualbox_180626.ova",
  version: "2.6.5",
  fileSize: "15.01 GB (16,118,895,104 bytes)",
  format: "VirtualBox Open Virtual Appliance (.ova)",
  releaseDate: "June 26, 2018",
  
  // REPLACE THIS WITH YOUR DIRECT CLOUD STORAGE URL (Google Drive, Cloudflare R2, AWS S3, Mega, etc.)
  downloadUrl: "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID",
  
  // Alternate mirror links if available
  mirrors: [
    {
      name: "Google Drive Mirror",
      url: "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID",
      speed: "Fast (15GB Limit)"
    },
    {
      name: "Cloudflare R2 / S3 Storage",
      url: "https://your-bucket.r2.cloudflarestorage.com/HDP_2.6.5_virtualbox_180626.ova",
      speed: "High Speed Egress"
    },
    {
      name: "Internet Archive Mirror",
      url: "https://archive.org/details/HDP_2.6.5_virtualbox",
      speed: "Unlimited Public Storage"
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
