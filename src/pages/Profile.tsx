import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAvatar,
  IonItem,
  IonLabel,
  IonList,
  IonButton,
} from '@ionic/react';

const Profile: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="ion-padding">
          <IonCard>
            <IonCardContent className="ion-text-center">
              <IonAvatar style={{ width: '100px', height: '100px', margin: '0 auto' }}>
                <img alt="Profile" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
              </IonAvatar>
              <h2>Teacher Name</h2>
              <p>teacher@sahayak.com</p>
            </IonCardContent>
          </IonCard>
          
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Account Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h3>Role</h3>
                    <p>Primary Teacher</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>School</h3>
                    <p>Demo School</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Member Since</h3>
                    <p>January 2025</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
          
          <IonButton expand="block" color="danger">
            Logout
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
