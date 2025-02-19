import { gql } from "@apollo/client"
import { queries as teamQueries } from "common/team/graphql"

const detailFields = teamQueries.detailFields
const allUsers = teamQueries.allUsers
const users = teamQueries.users

const userFields = `
  _id
  email
  username
  details {
    ${detailFields}
  }
`

export const commonStructureParamsDef = `
    $ids: [String]
    $excludeIds: Boolean,
    $perPage: Int,
    $page: Int
    $searchValue: String,
    $status:String,
`

const commonFeedFields = `
  _id
  title
  description
  contentType
  images
  attachments
  createdAt
  updatedAt
  likeCount
  heartCount
  isHearted
  isLiked
  isPinned
  commentCount
  recipientIds
  createdUser {
    ${userFields}
  }
  updatedUser {
    ${userFields}
  }
  eventData {
    visibility
    where
    startDate
    endDate
    interestedUserIds
    goingUserIds
  }
  customFieldsData
  departmentIds
  branchIds
  unitId
`

const feed = gql`
  query feed(
    $title: String
    $limit: Int
    $skip: Int
    $contentTypes: [ContentType]
  ) {
    exmFeed(
      title: $title
      limit: $limit
      skip: $skip
      contentTypes: $contentTypes
    ) {
      list {
        _id
        title
        isPinned
        recipientIds
        images
        eventData {
          visibility
          where
          startDate
          endDate
          interestedUserIds
          goingUserIds
        }
      }

      totalCount
    }
  }
`

const thanks = `
  query thanks($limit: Int) {
    exmThanks(limit: $limit) {
      list {
        _id
        description
        createdAt
        createdUser {
          ${userFields}
        }
        recipients {
          ${userFields}
        }
        recipientIds
      }

      totalCount
    }
  }
`

const fields = `
  query fields($contentType: String!) {
    fields(contentType: $contentType) {
      _id
      text
      options
      type
    }
  }
`

const departments = gql`
  query departments(
    $ids: [String]
    $searchValue: String
    $excludeIds: Boolean
  ) {
    departments(ids: $ids, searchValue: $searchValue, excludeIds: $excludeIds) {
      _id
      title
      description
      parentId
      code
      supervisorId
      userIds
    }
  }
`

const branches = gql`
  query branches($ids: [String], $searchValue: String, $excludeIds: Boolean) {
    branches(ids: $ids, searchValue: $searchValue, excludeIds: $excludeIds) {
      _id
      code
      title
      parentId
    }
  }
`

const unitsMain = gql`
  query unitsMain($ids: [String], $searchValue: String, $excludeIds: Boolean) {
    unitsMain(ids: $ids, searchValue: $searchValue, excludeIds: $excludeIds) {
      list {
        _id
        title
      }
    }
  }
`

const chats = `
  query chats($type: ChatType, $limit: Int, $skip: Int) {
    chats(type: $type, limit: $limit, skip: $skip) {
      list {
        _id
        name
        type
        isSeen
        isPinned
        isPinnedUserIds
        featuredImage
        lastMessage {
          content
          createdAt
          createdUser {
            _id
          }
          seenList {
            seenDate
            user {
              _id
            }
            lastSeenMessageId
          }
        }
        createdUser {
          _id
          email
          details {
            avatar
            description
            fullName
            operatorPhone
          }
        }
        createdAt
        participantUsers {
          _id
          email
          details {
            avatar
            description
            fullName
            position
            operatorPhone
          }
        }
      }
      totalCount
    }
  }
`

const chatDetail = `
  query chatDetail($id: String!) {
    chatDetail(_id: $id) {
      _id
      name
      type
      isSeen
      featuredImage
      lastMessage {
        createdAt
        content
      }
      createdUser {
        _id
        email
        details {
          avatar
          description
          fullName
          operatorPhone
        }
      }
      createdAt
      participantUsers {
        _id
        email
        employeeId
        isAdmin
        departments {
          title
        }
        branches {
          title
        }
        details {
          avatar
          description
          fullName
          operatorPhone
          position
        }
      }
    }
  }
`

const chatMessages = `
  query chatMessages($chatId: String, $limit: Int, $skip: Int) {
    chatMessages(chatId: $chatId, limit: $limit, skip: $skip) {
      list {
        _id
        content
        attachments
        createdUser {
          _id
          email
          details {
            avatar
            fullName
          }
        }
        createdAt
        relatedMessage {
          _id
          content
          createdUser {
            _id
            email
            details {
              avatar
              fullName
            }
          }
        }
        seenList {
          lastSeenMessageId
        }
      }
      totalCount
    }
  }
`

const getChatIdByUserIds = `
  query getChatIdByUserIds($userIds: [String]) {
    getChatIdByUserIds(userIds: $userIds)
  }
`

const comments = gql`
  query comments(
    $contentId: String!
    $contentType: ReactionContentType!
    $parentId: String
    $limit: Int
    $skip: Int
  ) {
    comments(
      contentId: $contentId
      contentType: $contentType
      parentId: $parentId
      limit: $limit
      skip: $skip
    ) {
      list {
        _id
        comment
        createdUser {
          _id
          details {
            avatar
            firstName
            fullName
            lastName
            position
          }
          email
          username
        }
        createdAt
        parentId
        contentId
      }
      totalCount
    }
  }
`

const emojiCount = gql`
  query emojiCount(
    $contentId: String!
    $contentType: ReactionContentType!
    $type: String!
  ) {
    emojiCount(contentId: $contentId, contentType: $contentType, type: $type)
  }
`

const exmFeedDetail = gql`
  query exmFeedDetail($_id: String!) {
    exmFeedDetail(_id: $_id) {
      ${commonFeedFields}
    }
  }
`

const emojiIsReacted = `
  query emojiIsReacted($contentId: String!, $contentType: ReactionContentType!, $type: String!) {
    emojiIsReacted(contentId: $contentId, contentType: $contentType, type: $type)
  }
`

const emojiReactedUsers = gql`
  query emojiReactedUsers(
    $contentId: String!
    $contentType: ReactionContentType!
    $type: String!
  ) {
    emojiReactedUsers(
      contentId: $contentId
      contentType: $contentType
      type: $type
    ) {
      _id
    }
  }
`

export default {
  feed,
  exmFeedDetail,
  thanks,
  fields,
  users,
  allUsers,
  departments,
  chats,
  chatDetail,
  chatMessages,
  getChatIdByUserIds,
  branches,
  unitsMain,
  comments,
  emojiCount,
  emojiIsReacted,
  emojiReactedUsers,
}
