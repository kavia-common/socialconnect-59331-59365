const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SocialConnect Backend API',
      version: '1.0.0',
      description:
        'Express API for SocialConnect with authentication, users, posts, follows, likes, comments, notifications, and media upload (Cloudinary).',
      contact: {
        name: 'SocialConnect API Team',
      },
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Local server' },
    ],
    tags: [
      { name: 'Auth', description: 'User authentication and session' },
      { name: 'Users', description: 'User profiles and search' },
      { name: 'Posts', description: 'Create, list, search, like, comment' },
      { name: 'Follows', description: 'Follow and unfollow users' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Media', description: 'Cloudinary uploads and signatures' },
      { name: 'Health', description: 'Service health and status' },
      { name: 'WebSocket', description: 'Socket.IO connection information' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide the JWT token as: Bearer <token>',
        },
      },
      schemas: {
        // Common
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  location: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            message: { type: 'string', example: 'Service is healthy' },
            timestamp: { type: 'string', format: 'date-time' },
            environment: { type: 'string', example: 'development' },
          },
        },
        // Auth
        SignupRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 30 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 128 },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['emailOrUsername', 'password'],
          properties: {
            emailOrUsername: { type: 'string' },
            password: { type: 'string', minLength: 8, maxLength: 128 },
          },
        },
        AuthTokenUser: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        // Users
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            bio: { type: 'string' },
            avatarUrl: { type: 'string' },
            isVerified: { type: 'boolean' },
            lastLoginAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            bio: { type: 'string', maxLength: 1600 },
            avatarUrl: { type: 'string', format: 'uri' },
            username: { type: 'string', minLength: 3, maxLength: 30 },
          },
        },
        PublicProfile: {
          allOf: [
            { $ref: '#/components/schemas/User' },
            {
              type: 'object',
              properties: {
                stats: {
                  type: 'object',
                  properties: {
                    followers: { type: 'integer' },
                    following: { type: 'integer' },
                  },
                },
                isFollowing: { type: 'boolean' },
              },
            },
          ],
        },
        // Posts and interactions
        MediaObject: {
          type: 'object',
          required: ['url', 'type'],
          properties: {
            url: { type: 'string', format: 'uri' },
            type: { type: 'string', enum: ['image', 'video'] },
            publicId: { type: 'string' },
            width: { type: 'integer' },
            height: { type: 'integer' },
            duration: { type: 'number' },
          },
        },
        CreatePostRequest: {
          type: 'object',
          required: ['media'],
          properties: {
            caption: { type: 'string', maxLength: 2200 },
            hashtags: {
              type: 'array',
              items: { type: 'string', maxLength: 100 },
              description: 'Array of hashtags (without #)',
            },
            media: { $ref: '#/components/schemas/MediaObject' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            author: { $ref: '#/components/schemas/User' },
            caption: { type: 'string' },
            hashtags: { type: 'array', items: { type: 'string' } },
            media: { $ref: '#/components/schemas/MediaObject' },
            isPublic: { type: 'boolean' },
            likeCount: { type: 'integer' },
            commentCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            post: { type: 'string' },
            author: { $ref: '#/components/schemas/User' },
            text: { type: 'string' },
            parentComment: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AddCommentRequest: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string', minLength: 1, maxLength: 1000 },
            parentComment: { type: 'string', nullable: true },
          },
        },
        LikeResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            liked: { type: 'boolean', example: true },
            alreadyLiked: { type: 'boolean', example: false },
          },
        },
        UnlikeResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            liked: { type: 'boolean', example: false },
            removed: { type: 'boolean', example: true },
          },
        },
        // Follows
        FollowActionResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            followingUserId: { type: 'string' },
          },
        },
        // Notifications
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            actor: { $ref: '#/components/schemas/User' },
            type: { type: 'string', enum: ['like', 'comment', 'follow'] },
            post: { type: 'string', nullable: true },
            comment: { type: 'string', nullable: true },
            isRead: { type: 'boolean' },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // Media (Cloudinary)
        MediaSignatureRequest: {
          type: 'object',
          properties: {
            folder: { type: 'string', maxLength: 200 },
            timestamp: { type: 'integer' },
            public_id: { type: 'string', maxLength: 200 },
            tags: { type: 'string', maxLength: 500 },
            resource_type: { type: 'string', enum: ['image', 'video', 'auto'] },
            eager: { type: 'string', maxLength: 500 },
          },
        },
        MediaSignatureResponse: {
          type: 'object',
          properties: {
            cloudName: { type: 'string' },
            apiKey: { type: 'string' },
            timestamp: { type: 'integer' },
            signature: { type: 'string' },
            payload: { type: 'object' },
          },
        },
        MediaUploadResponse: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            secureUrl: { type: 'string' },
            publicId: { type: 'string' },
            resourceType: { type: 'string' },
            type: { type: 'string' },
            width: { type: 'integer' },
            height: { type: 'integer' },
            duration: { type: 'number' },
            bytes: { type: 'integer' },
            format: { type: 'string' },
          },
        },
      },
      parameters: {
        UsernameParam: {
          name: 'username',
          in: 'path',
          required: true,
          schema: { type: 'string', minLength: 3, maxLength: 30 },
          description: 'Target username',
        },
        PostIdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Post id',
        },
        NotificationIdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Notification id',
        },
        LimitQuery: {
          name: 'limit',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          description: 'Max items to return',
        },
        OnlyUnreadQuery: {
          name: 'onlyUnread',
          in: 'query',
          required: false,
          schema: { type: 'string', enum: ['0', '1'], default: '0' },
          description: 'Filter only unread notifications when 1',
        },
        SearchQuery: {
          name: 'q',
          in: 'query',
          required: true,
          schema: { type: 'string', minLength: 1 },
          description: 'Search text or hashtag (e.g., #nature)',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Missing or invalid authentication',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        ValidationError: {
          description: 'Invalid request parameters',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
      },
    },
  },
  // Include all route files with JSDoc @swagger annotations
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
