// middleware for doing role-based permissions
export default function permit(...permittedRoles: any) {
  // return a middleware
  return (request: any, response: any, next: any) => {
    const { user } = request.session;
    if (user && permittedRoles.includes(user.role)) {
      next(); // role is allowed, so continue on the next middleware
    } else {
      response.status(403).json({ message: 'You are not an authenticated user for this session' }); // user is forbidden
    }
  };
};
