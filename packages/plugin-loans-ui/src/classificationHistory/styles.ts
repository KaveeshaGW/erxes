import { colors } from '@erxes/ui/src';
import styled from 'styled-components';

const ClassificationHistoryTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  tr:nth-child(odd) {
    background-color: ${colors.colorShadowGray};
  }
`;

export { ClassificationHistoryTableWrapper };
