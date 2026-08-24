import connectDB from "./src/lib/mongodb";
import ChatLog from "./src/models/ChatLog";

connectDB().then(async () => {
    const count = await ChatLog.countDocuments();
    console.log("Total ChatLogs in DB:", count);
    
    const latest = await ChatLog.find().sort({ createdAt: -1 }).limit(3);
    console.log("Latest:", latest);
    
    process.exit(0);
});
