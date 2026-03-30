async function test() {
    const res = await fetch("https://tedbud.vercel.app/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 100 })
    });
    console.log(res.status, await res.text());
}
test();
