const axios = require("axios");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/ebay-search", async (req, res) => {
  const { query } = req.query;
  const apiUrl = `https://api.ebay.com/commerce/catalog/v1/product/${query}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization:
          "v^1.1#i^1#f^0#I^3#r^0#p^1#t^H4sIAAAAAAAAAOVYa2wURRzv9QlCNUIDBiG5LA0odfdm994b7uD6oFRLr+XaQmsa3Mdsu9ze7rEzS+/Ax1EV/KIxEElQYkgw+gEIUYiCaDR88INCokgiEhNDoNFgJD5AavSDs3ulXCuBQi+xifdlb2b+z9/8HzMDcpUzl21fvf16tauqdF8O5EpdLnYWmFlZUXd/WemCihJQQODal6vNlQ+V/bgcCSktza+FKG3oCLozKU1HvDMZoSxT5w0BqYjXhRREPJb4RGxNK88xgE+bBjYkQ6PcLY0RSvKLIcD5Wc7nDwSCAUhm9RsyO40IJfuVkMIJfglwIW8grJB1hCzYoiMs6DhCcYDz0YCjWbaTAzxgeQ4wXJjtpdzd0ESqoRMSBlBRx1ze4TULbL29qQJC0MRECBVtia1KxGMtjU1tncs9BbKiozgksIAtNH7UYMjQ3S1oFry9GuRQ8wlLkiBClCea1zBeKB+7Ycw9mO9AzYZ9UAj4oZ/1iQEl4C0KlKsMMyXg29thz6gyrTikPNSxirN3QpSgIW6EEh4dtRERLY1u+9NhCZqqqNCMUE31sZ5YezsVjekqHjBVhR77k6hfT4OgIgEFhoM09CohWeLkUUV5aaMwT9DUYOiyaoOG3G0GrofEajgOGzbM+wuwIURxPW7GFGxbVIghdwPDULDX3tT8Llp4QLf3FaYIEG5neOcdGOPG2FRFC8MxCRMXHIgilJBOqzI1cdGJxdHwyaAINYBxmvd4BgcHmUEvY5j9Hg4A1rN+TWtCGoApgSK0dq7n6dU7M9Cq44pE0pjQ8zibJrZkSKwSA/R+Kupj/f6gfxT38WZFJ87+a6LAZ8/4jChWhgTDUpCTFUGBYkAUoFiMDImOBqnHtgOKQpZOCWYS4rQmSJCWSJxZKWiqMu/1K5w3pEBaJmWO9oUVhRb9coBmFQgBhKIohUP/p0SZbKgnoGRCXJRYL1qcr495unt6Q0Kz0tgYy9Q1ZZXujNymtCc6kptAgw5Svrr0ppCnvdvXFZlsNtzS+QZNJch0Ev3FAMDO9eKBsNpAGMpTci8hGWnYbmiqlJ1eG+w15XbBxNl6K0vGCahp5DMlV2PpdEtxKnbRnLzLYnFvfhevU/1HXeqWXiE7cKeXVzY/IgKEtMqQPmTnepaRjJTHEMghxJ7e4FjtnkB4SyKPaGWZfgsiTCyRyTlw0kwqKeYMaWny5FnyDZM4MXkWcsmQLQnfkyKnMzMETbV/AKO70pmZCiiipSUnzyJDQZtSiKrkqjGtApR4mndZlfN3BMbxm0GbJcaEyLBMcj1i4vaRudNIQp0cQLBpaBo0u9kpl95UysKCqMHpVoOLUItUkuuukWl2QmKDIBgIsYEQmJJvknP+2TDdOkixO+dd3IQ8499loiXOjx1yfQyGXMdLXS4QBDRbBx6tLOsqL5tNIVJ7GCTosmhkGFVQGFL2dAFbJmSSMJsWVLO00qWePyuNFLwI7esDD429Cc0sY2cVPBCBhTdXKtgH5ldzPsCxrA0gB3rB4pur5ey88pqqpTse/HTPm62b36hd0ffU73MPX2/KguoxIperooSEb8mMFx4+sXFJZfOI3ttx4M89G/4+eIKhf8tIrYGeD/kjypzswq+bkkB78fTleODCQu/PrbWJuPRE7fJt/uornanVw1+dog4Nb9k/72Lzl91zHvlj9v7GvXhRVv11TavU/PxPu2rmvTeyIlp1utP39tad5UdDg2v37D54Lrfg/MtXTmvRi627tx3YUrbol3eXuf96a/DYocei5YuqL75a48l9VqmePZrcu7Wva9h4cr73k0u5rjNLr8w4/IH3o7nvXw2dP3XtmBSqbX7p++ce/2Z3x851+78oe/rktWfR61fF1y4d37Xz3Lqq6NDJC/ft2rG44Zl34j80NX3+3bc9SaPmzKWVYkPf1pXmK0sudwwfyW/jPx4TY6KrEwAA",
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data from eBay" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
