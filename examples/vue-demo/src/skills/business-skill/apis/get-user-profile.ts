import type { AtomicAbilityInput, FacadeContext } from '@eff-facade/facade'
import { request } from './request'

const DEFAULT_USER_ID = 'u1001'

interface UserProfileResponse {
  data: {
    userId: string
    name: string
    department: string
    role: string
    status: string
    recentActions: Array<{
      time: string
      action: string
      target: string
    }>
  }
}

export async function getUserProfile(
  ctx: FacadeContext,
  input: AtomicAbilityInput
) {
  const userId = String(input.params?.userId ?? DEFAULT_USER_ID)
  const response = await request<UserProfileResponse>(ctx, {
    url: `/api/users/${userId}`
  })
  const profile = response.data

  return {
    type: 'mixed',
    status: 'done',
    title: '用户信息',
    blocks: [
      {
        type: 'description',
        status: 'done',
        title: '当前用户',
        data: {
          userId: profile.userId,
          name: profile.name,
          department: profile.department,
          role: profile.role,
          status: profile.status
        }
      },
      {
        type: 'table',
        status: 'done',
        title: '最近操作',
        columns: [
          {
            key: 'time',
            title: '时间'
          },
          {
            key: 'action',
            title: '动作'
          },
          {
            key: 'target',
            title: '对象'
          }
        ],
        dataSource: profile.recentActions
      }
    ]
  } as const
}
