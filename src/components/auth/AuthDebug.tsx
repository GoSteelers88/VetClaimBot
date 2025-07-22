'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, getDb } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthDebug() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    setResult('Testing authentication...');
    
    try {
      // Test basic auth first
      console.log('Creating user with email and password...');
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const user = userCredential.user;
      
      setResult(`✅ User created successfully! UID: ${user.uid}`);
      
      // Test Firestore write
      console.log('Testing Firestore write...');
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: 'Test User',
        createdAt: new Date(),
        profileComplete: false
      };
      
      await setDoc(doc(getDb(), 'users', user.uid), userData);
      setResult(prev => prev + '\n✅ Firestore write successful!');
      
    } catch (error: any) {
      console.error('Auth test error:', error);
      setResult(`❌ Error: ${error.message}\nCode: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  const testFirestore = async () => {
    setLoading(true);
    setResult('Testing Firestore connection...');
    
    try {
      // Test basic Firestore write
      const testDoc = {
        test: 'Hello Firestore',
        timestamp: new Date(),
        random: Math.random()
      };
      
      await setDoc(doc(getDb(), 'test', 'connection'), testDoc);
      setResult('✅ Firestore connection successful!');
      
    } catch (error: any) {
      console.error('Firestore test error:', error);
      setResult(`❌ Firestore Error: ${error.message}\nCode: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Firebase Debug Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={testFirestore} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Test Firestore Connection
          </Button>
          
          <Button 
            onClick={testAuth} 
            disabled={loading}
            className="w-full"
          >
            Test Full Auth + Firestore
          </Button>
        </div>
        
        {result && (
          <div className="bg-gray-100 p-3 rounded text-sm font-mono whitespace-pre-wrap">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}