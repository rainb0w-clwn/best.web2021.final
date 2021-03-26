import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { view } from '@risingstack/react-easy-state';

import { SocketEvents } from '../constants';
import { gameStore } from './GameStore';

const gameIdFromLocalStorage = localStorage.getItem('gameId');

const EnterGame = view(() => {
  const {
    loading,
    actions: { enterGame },
  } = gameStore;

  const [gameId, setGameId] = useState(gameIdFromLocalStorage || '');
  const [rememberGameId, setRememberGameId] = useState(
    !!gameIdFromLocalStorage,
  );

  return (
    <Container fluid="md" className="mt-5 pt-5">
      <Row>
        <Col xs={{ span: 8, offset: 2 }}>
          <Row className="font-weight-bold">
            <Col>
              <h4>ENTER GAME</h4>
            </Col>
          </Row>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              enterGame({
                eventType: SocketEvents.CREATEGAME,
                gameId,
                rememberGameId,
              });
            }}
          >
            <Form.Group controlId="GameId">
              <Form.Label>
                <h5 className="font-weight-normal mb-0">
                  Your game’s name:
                </h5>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Game Name"
                onChange={(event) => setGameId(event.target.value)}
                value={gameId}
                autoComplete="off"
                style={{ fontSize: '1.125rem' }}
              />
            </Form.Group>
            <Form.Group controlId="RememberGameId">
              <Form.Check
                type="switch"
                label={<span>Remember me</span>}
                defaultChecked={rememberGameId}
                onChange={(e) => setRememberGameId(e.target.checked)}
                style={{ fontSize: '1.125rem' }}
              />
            </Form.Group>
            <Row className="my-4">
              <Col>
                <Button
                  variant="outline-primary"
                  className="rounded-pill w-100"
                  type="button"
                  disabled={!gameId || loading}
                  onClick={() =>
                    enterGame({
                      eventType: SocketEvents.CREATEGAME,
                      gameId,
                      rememberGameId,
                    })
                  }
                >
                  <h4 className="font-weight-normal mb-0">
                    Create Game
                  </h4>
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button
                  variant="outline-primary"
                  className="rounded-pill w-100"
                  type="button"
                  disabled={!gameId || loading}
                  onClick={() =>
                    enterGame({
                      eventType: SocketEvents.JOINGAME,
                      gameId,
                      rememberGameId,
                    })
                  }
                >
                  <h4 className="font-weight-normal mb-0">
                    Join Game
                  </h4>
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Container>
  );
});

export default EnterGame;
