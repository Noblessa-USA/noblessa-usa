export default async (request, context) => {
  const url = new URL(request.url);

  // Only test Arabic homepage
  if (url.pathname !== "/ar/") {
    return context.next();
  }

  // Keep existing assignment
  const cookie = request.headers.get("cookie") || "";

  if (cookie.includes("noblessa_ar_variant=short")) {
    return Response.redirect(
      new URL("/ar/short/", request.url),
      302
    );
  }

  if (cookie.includes("noblessa_ar_variant=control")) {
    return context.next();
  }

  // Random 50/50 assignment
  const variant = Math.random() < 0.5 ? "short" : "control";

  if (variant === "short") {
    const response = Response.redirect(
      new URL("/ar/short/", request.url),
      302
    );

    response.headers.append(
      "Set-Cookie",
      "noblessa_ar_variant=short; Path=/; Max-Age=2592000; SameSite=Lax"
    );

    return response;
  }

  const response = await context.next();

  response.headers.append(
    "Set-Cookie",
    "noblessa_ar_variant=control; Path=/; Max-Age=2592000; SameSite=Lax"
  );

  return response;
};