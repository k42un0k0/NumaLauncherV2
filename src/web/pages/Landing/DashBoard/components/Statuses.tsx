import { statusToHex, statuses } from "@/web/utils/api/mojang";
import { css } from "@emotion/react";
import { Fragment, useState } from "react";
import { TransitionGroup } from "react-transition-group";
import Fade from "../../../components/Fade";

export default function Statuses() {
  const essential = statuses.filter((status) => status.essential);
  const nonessential = statuses.filter((status) => !status.essential);
  const [open, setOpen] = useState(false);
  return (
    <div css={styles.root}>
      <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        <span>MOJANGステータス</span>
        <span style={{ color: statusToHex("green"), fontSize: 30 }}>&#8226;</span>
      </div>
      <TransitionGroup>
        {open ? (
          <Fade css={styles.tooltip}>
            <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
              <div css={styles.heading}>サービス</div>
              <div>
                {essential.map((service) => {
                  return (
                    <div key={service.service} css={styles.statusContainer}>
                      <span style={{ color: statusToHex(service.status), fontSize: 50, lineHeight: "7px" }}>
                        &#8226;
                      </span>
                      <span>{service.name}</span>
                    </div>
                  );
                })}
              </div>
              <div css={styles.heading}>
                <div css={styles.line}></div>
                <div>Non Essential</div>
                <div css={styles.line}></div>
              </div>
              <div>
                {nonessential.map((service) => {
                  return (
                    <div key={service.service} css={styles.statusContainer}>
                      <span style={{ color: statusToHex(service.status), fontSize: 50, lineHeight: "7px" }}>
                        &#8226;
                      </span>
                      <span>{service.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Fade>
        ) : undefined}
      </TransitionGroup>
    </div>
  );
}

const styles = {
  tooltip: css`
    position: absolute;
    bottom: 50px;
    left: -20px;
    padding: 10px;
    width: 200px;
    background-color: rgba(0, 0, 0, 1);
    box-shadow: 0px 0px 20px rgb(0, 0, 0);
  `,
  heading: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  line: css`
    height: 1px;
    flex: 1;
    background-color: white;
  `,
  statusContainer: css`
    display: flex;
    margin: 10px 0;
    font-size: 12px;
  `,
  root: css`
    position: relative;
    font-size: 12px;
  `,
};
