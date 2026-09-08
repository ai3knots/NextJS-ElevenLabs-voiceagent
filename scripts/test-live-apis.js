const testApis = async () => {
  const payload = {
    to: "ai.3knotes@gmail.com",
    name: "Kashif",
    planType: "all"
  };
  
  const res1 = await fetch("https://next-js-eleven-labs-voiceagent.vercel.app/api/send-marketing-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  console.log("send-marketing-plan status:", res1.status);
  console.log("send-marketing-plan body:", await res1.text());

  const res2 = await fetch("https://next-js-eleven-labs-voiceagent.vercel.app/api/send-ghostwriting-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  console.log("send-ghostwriting-plan status:", res2.status);
  console.log("send-ghostwriting-plan body:", await res2.text());
};
testApis();
